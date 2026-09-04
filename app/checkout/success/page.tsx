import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, Package, Truck } from "lucide-react";
import ClearCartOnMount from "@/components/shop/ClearCartOnMount";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { getOrderBySessionId } from "@/lib/data";
import { reconcileCheckoutSession } from "@/lib/fulfillment";
import { money } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  // Settle the order straight from Stripe. The webhook normally does this
  // first, but this makes the confirmation correct even when the webhook
  // hasn't been forwarded (e.g. local dev without `stripe listen`).
  if (sessionId) await reconcileCheckoutSession(sessionId);

  const order = sessionId ? await getOrderBySessionId(sessionId) : null;

  return (
    <section className="dv-container max-w-3xl py-16">
      <ClearCartOnMount />

      <div className="rounded-[1.75rem] border border-dv-line bg-white p-8 text-center sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-dv-success-bg">
          <CheckCircle2 className="h-8 w-8 text-dv-success" />
        </span>

        <h1 className="mt-6 font-display text-3xl text-dv-teal-900">Thank you for your order!</h1>
        <p className="mt-3 text-sm leading-relaxed text-dv-ink-soft">
          Your payment went through and a confirmation email is on its way. We&apos;ll let you know
          the moment your Dentivital order ships.
        </p>

        {order ? (
          <>
            <div className="mt-8 rounded-2xl bg-dv-mint-50 p-6 text-left">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dv-line pb-4">
                <div>
                  <p className="text-xs text-dv-ink-soft">Order number</p>
                  <p className="font-display text-lg text-dv-teal-900">{order.orderNumber}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <ul className="mt-4 space-y-2.5">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex justify-between gap-4 text-sm">
                    <span className="min-w-0 text-dv-ink">
                      <span className="text-dv-ink-soft">{item.quantity} ×</span> {item.name}
                    </span>
                    <span className="shrink-0 font-medium text-dv-teal-900">
                      {money(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-2 border-t border-dv-line pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-dv-ink-soft">Subtotal</dt>
                  <dd className="text-dv-teal-900">{money(order.subtotal)}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-dv-success">
                    <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                    <dd>−{money(order.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-dv-ink-soft">
                    Shipping{order.shippingMethod ? ` · ${order.shippingMethod.label}` : ""}
                  </dt>
                  <dd className="text-dv-teal-900">
                    {order.shippingCost === 0 ? "Free" : money(order.shippingCost)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-dv-line pt-2">
                  <dt className="font-display text-base text-dv-teal-900">Total paid</dt>
                  <dd className="font-display text-lg text-dv-teal-900">{money(order.total)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { Icon: Mail, title: "Confirmation", body: `Sent to ${order.email}` },
                { Icon: Package, title: "Packing", body: "Usually within 1 business day" },
                {
                  Icon: Truck,
                  title: "Delivery",
                  body: order.shippingMethod?.label ?? "Standard shipping",
                },
              ].map(({ Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-dv-line p-4 text-left">
                  <Icon className="h-4 w-4 text-dv-teal-700" />
                  <p className="mt-2 text-xs font-medium text-dv-teal-900">{title}</p>
                  <p className="mt-0.5 break-words text-[11px] text-dv-ink-soft">{body}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-dv-line-strong p-5 text-sm text-dv-ink-soft">
            We&apos;re still finalising your order details. Check{" "}
            <Link href="/account/orders" className="dv-link-underline text-dv-teal-900">
              your orders
            </Link>{" "}
            in a moment — the confirmation email will arrive shortly either way.
          </p>
        )}

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/account/orders"
            className="rounded-full bg-dv-teal-900 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-dv-coral-600"
          >
            Track my order
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-dv-line-strong bg-white px-7 py-3.5 text-sm font-medium text-dv-teal-900 transition-colors hover:bg-dv-mint-100"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
