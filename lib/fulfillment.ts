import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import Product from "@/models/Product";

/**
 * Everything that has to happen once an order is actually paid for.
 *
 * This lives in one place because two different things can trigger it:
 *   • the Stripe webhook (the reliable path, used in production), and
 *   • the /checkout/success page (a fallback, so local development still
 *     works when `stripe listen` isn't running).
 *
 * It is idempotent — calling it twice on the same order does nothing the
 * second time, so stock is never decremented and a coupon never counted twice.
 */
type OrderDoc = Awaited<ReturnType<typeof Order.findById>>;

export async function markOrderPaid(
  order: NonNullable<OrderDoc>,
  session: Stripe.Checkout.Session
): Promise<boolean> {
  if (order.paymentStatus === "paid") return false;

  order.paymentStatus = "paid";
  order.status = "paid";
  order.stripeSessionId = session.id;
  order.paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);
  order.timeline.push({
    status: "paid",
    note: "Payment received via Stripe.",
    at: new Date(),
  });

  if (!order.shippingAddress && session.customer_details?.address) {
    const a = session.customer_details.address;
    order.shippingAddress = {
      fullName: session.customer_details.name ?? order.customerName,
      line1: a.line1 ?? "",
      line2: a.line2 ?? "",
      city: a.city ?? "",
      state: a.state ?? "",
      postalCode: a.postal_code ?? "",
      country: a.country ?? "",
      phone: session.customer_details.phone ?? "",
    };
  }

  await order.save();

  await Promise.all(
    order.items.map((item: { productId: string; quantity: number }) =>
      Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      ).catch((e) => console.error("[fulfillment] stock update failed", e))
    )
  );

  if (order.couponCode) {
    await Coupon.updateOne(
      { code: order.couponCode },
      { $inc: { timesRedeemed: 1 } }
    ).catch((e) => console.error("[fulfillment] coupon update failed", e));
  }

  return true;
}

/**
 * Reads the real state of a Checkout Session back from Stripe and settles the
 * matching order. Safe to call on every visit to the success page: if the
 * webhook already handled it, this is a no-op.
 */
export async function reconcileCheckoutSession(sessionId: string): Promise<void> {
  if (!sessionId || !process.env.STRIPE_SECRET_KEY) return;

  try {
    await connectDB();
    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order || order.paymentStatus === "paid") return;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid" || session.status === "complete") {
      await markOrderPaid(order, session);
    }
  } catch (err) {
    // Never break the confirmation page over this — the webhook is still the
    // authoritative path and will catch up.
    console.error("[fulfillment] reconcile failed", err);
  }
}
