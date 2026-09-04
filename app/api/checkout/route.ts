import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import Product from "@/models/Product";
import ShippingRate from "@/models/ShippingRate";
import { getSessionFromRequest } from "@/lib/auth";
import { evaluateCoupon, shippingCostFor } from "@/lib/pricing";
import { generateOrderNumber, round2 } from "@/lib/format";
import { CURRENCY_CODE, STRIPE_CURRENCY, toStripeAmount } from "@/lib/currency";
import type { Coupon as CouponType, ShippingRate as ShippingRateType } from "@/types";

export const runtime = "nodejs";

const schema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().min(1).max(99) }))
    .min(1, "Your cart is empty."),
  email: z.email("Please enter a valid email address."),
  customerName: z.string().trim().min(2, "Please enter your name.").max(120),
  couponCode: z.string().trim().nullable().optional(),
  shippingRateId: z.string().trim().nullable().optional(),
  shippingAddress: z
    .object({
      fullName: z.string().trim().min(2, "Please enter the recipient's name."),
      line1: z.string().trim().min(3, "Please enter a street address."),
      line2: z.string().trim().optional().default(""),
      city: z.string().trim().min(1, "Please enter a city."),
      state: z.string().trim().optional().default(""),
      postalCode: z.string().trim().min(2, "Please enter a postal code."),
      country: z.string().trim().min(2, "Please choose a country."),
      phone: z.string().trim().optional().default(""),
    })
    .nullable()
    .optional(),
});

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments aren't configured yet. Add STRIPE_SECRET_KEY to your environment." },
      { status: 501 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." },
      { status: 400 }
    );
  }

  const session = getSessionFromRequest(req);

  // Staff accounts manage the store, they don't shop in it. Blocking this here
  // (not just in the UI) keeps test orders out of the real sales figures.
  if (session?.role === "admin") {
    return NextResponse.json(
      {
        error:
          "You're signed in as an admin. Sign out (or use a customer account) to place an order.",
      },
      { status: 403 }
    );
  }

  const { items, email, customerName, couponCode, shippingRateId, shippingAddress } = parsed.data;

  try {
    await connectDB();

    /* 1. Re-price the cart from the database — never trust client prices. */
    const products = await Product.find({
      _id: { $in: items.map((i) => i.productId) },
    }).lean();

    const lineItems = [];
    for (const item of items) {
      const product = products.find((p) => String(p._id) === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: "One of the items in your cart is no longer available." },
          { status: 409 }
        );
      }
      if (product.active === false) {
        return NextResponse.json(
          { error: `“${product.name}” is no longer available.` },
          { status: 409 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error:
              product.stock === 0
                ? `“${product.name}” just sold out.`
                : `Only ${product.stock} left of “${product.name}”. Please reduce the quantity.`,
          },
          { status: 409 }
        );
      }
      lineItems.push({
        productId: String(product._id),
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] ?? "",
      });
    }

    const subtotal = round2(lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0));

    /* 2. Validate the coupon server-side. */
    let discount = 0;
    let appliedCode: string | null = null;
    if (couponCode) {
      const doc = await Coupon.findOne({ code: couponCode.trim().toUpperCase() }).lean();
      const coupon = doc ? (JSON.parse(JSON.stringify(doc)) as CouponType) : null;
      const result = evaluateCoupon(coupon, subtotal);
      if (!result.ok) {
        return NextResponse.json({ error: result.reason }, { status: 400 });
      }
      discount = result.discount;
      appliedCode = result.coupon.code;
    }

    /* 3. Resolve the shipping method. */
    let shippingMethod: { label: string; price: number } | null = null;
    let shippingCost = 0;
    if (shippingRateId) {
      const doc = await ShippingRate.findById(shippingRateId)
        .lean()
        .catch(() => null);
      if (!doc) {
        return NextResponse.json({ error: "That shipping method is unavailable." }, { status: 400 });
      }
      const rate = JSON.parse(JSON.stringify(doc)) as ShippingRateType;
      shippingCost = shippingCostFor(rate, round2(subtotal - discount));
      shippingMethod = { label: rate.label, price: shippingCost };
    }

    const total = round2(subtotal - discount + shippingCost);
    if (total <= 0) {
      return NextResponse.json(
        { error: "Order total must be greater than zero." },
        { status: 400 }
      );
    }

    /* 4. Record the order as pending before sending the customer to Stripe. */
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: session?.id ?? null,
      email: email.toLowerCase(),
      customerName,
      items: lineItems,
      subtotal,
      discount,
      shippingCost,
      total,
      currency: STRIPE_CURRENCY,
      couponCode: appliedCode,
      shippingMethod,
      shippingAddress: shippingAddress ?? null,
      status: "pending",
      paymentStatus: "unpaid",
      timeline: [{ status: "pending", note: "Order created, awaiting payment.", at: new Date() }],
    });

    /* 5. Hand off to Stripe Checkout. */
    const origin =
      req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    let stripeCouponId: string | undefined;
    let checkout: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;

    try {
      if (discount > 0) {
        const created = await stripe.coupons.create({
          amount_off: toStripeAmount(discount),
          currency: STRIPE_CURRENCY,
          duration: "once",
          name: appliedCode ? `Code ${appliedCode}` : "Discount",
        });
        stripeCouponId = created.id;
      }

      checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        client_reference_id: String(order._id),
        line_items: lineItems.map((item) => ({
          price_data: {
            currency: STRIPE_CURRENCY,
            product_data: {
              name: item.name,
              ...(item.image?.startsWith("http") ? { images: [item.image] } : {}),
            },
            unit_amount: toStripeAmount(item.price),
          },
          quantity: item.quantity,
        })),
        ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
        ...(shippingMethod
          ? {
              shipping_options: [
                {
                  shipping_rate_data: {
                    type: "fixed_amount" as const,
                    fixed_amount: {
                      amount: toStripeAmount(shippingMethod.price),
                      currency: STRIPE_CURRENCY,
                    },
                    display_name: shippingMethod.label,
                  },
                },
              ],
            }
          : {}),
        metadata: {
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          couponCode: appliedCode ?? "",
        },
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart?cancelled=1`,
      });
    } catch (err) {
      // Stripe refused the session — don't leave an orphan "pending" order behind.
      order.status = "cancelled";
      order.timeline.push({
        status: "cancelled",
        note: "Stripe rejected the checkout session.",
        at: new Date(),
      });
      await order.save().catch(() => {});

      const code = (err as { code?: string })?.code;
      if (code === "amount_too_small") {
        console.error("[checkout] amount_too_small —", (err as Error).message);
        return NextResponse.json(
          {
            error:
              `This order total is below the minimum ${CURRENCY_CODE} amount Stripe will charge. ` +
              `Please check that your product prices are set in ${CURRENCY_CODE}.`,
          },
          { status: 400 }
        );
      }
      throw err;
    }

    order.stripeSessionId = checkout.id;
    await order.save();

    return NextResponse.json({ url: checkout.url, orderNumber: order.orderNumber });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: "We couldn't start the checkout. Please try again in a moment." },
      { status: 500 }
    );
  }
}
