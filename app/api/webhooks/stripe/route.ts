import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { markOrderPaid } from "@/lib/fulfillment";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await connectDB();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId ?? session.client_reference_id;
        if (!orderId) break;

        const order = await Order.findById(orderId).catch(() => null);
        if (!order) {
          console.error("[webhook] order not found for session", session.id);
          break;
        }

        // Stripe can deliver the same event more than once — markOrderPaid is
        // idempotent, so a repeat delivery is a no-op.
        await markOrderPaid(order, session);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId ?? session.client_reference_id;
        if (!orderId) break;
        const order = await Order.findById(orderId).catch(() => null);
        if (order && order.paymentStatus === "unpaid") {
          order.status = "cancelled";
          order.timeline.push({
            status: "cancelled",
            note: "Checkout expired before payment.",
            at: new Date(),
          });
          await order.save();
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (!paymentIntentId) break;
        const order = await Order.findOne({ paymentIntentId });
        if (order) {
          order.paymentStatus = "refunded";
          order.status = "refunded";
          order.timeline.push({
            status: "refunded",
            note: "Refund issued in Stripe.",
            at: new Date(),
          });
          await order.save();
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] handler failed", err);
    // 500 tells Stripe to retry the delivery.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
