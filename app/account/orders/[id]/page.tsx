import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, Truck } from "lucide-react";
import { OrderStatusBadge } from "@/components/ui/Badge";
import OrderTimeline from "@/components/dashboard/OrderTimeline";
import { getSession } from "@/lib/auth";
import { getOrderById } from "@/lib/data";
import { formatDateTime, money } from "@/lib/format";

export const metadata: Metadata = { title: "Order details" };

type Props = { params: Promise<{ id: string }> };

export default async function AccountOrderPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const order = await getOrderById(id);
  if (!order) notFound();
  // A shopper may only open their own orders; admins use the admin view.
  if (order.userId !== session.id && session.role !== "admin") notFound();

  return (
    <>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-xs text-dv-ink-soft transition-colors hover:text-dv-coral-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
      </Link>

      <header className="mt-5 mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-dv-coral-600">Order</p>
          <h1 className="mt-2 font-display text-3xl text-dv-teal-900">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-dv-ink-soft">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-2xl border border-dv-line bg-white p-6">
            <h2 className="font-display text-lg text-dv-teal-900">Items</h2>
            <ul className="mt-4 divide-y divide-dv-line">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-dv-mint-100">
                    {item.image && (
                      <Image src={item.image} alt="" fill sizes="64px" className="object-contain p-1.5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="block text-sm font-medium text-dv-teal-900 hover:text-dv-coral-600"
                    >
                      {item.name}
                    </Link>
                    <span className="mt-0.5 block text-xs text-dv-ink-soft">
                      {item.quantity} × {money(item.price)}
                    </span>
                  </span>
                  <span className="shrink-0 font-display text-base text-dv-teal-900">
                    {money(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-dv-line pt-5 text-sm">
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
              <div className="flex justify-between border-t border-dv-line pt-3">
                <dt className="font-display text-base text-dv-teal-900">Total</dt>
                <dd className="font-display text-lg text-dv-teal-900">{money(order.total)}</dd>
              </div>
            </dl>
          </section>

          {order.shippingAddress && (
            <section className="rounded-2xl border border-dv-line bg-white p-6">
              <h2 className="flex items-center gap-2 font-display text-lg text-dv-teal-900">
                <MapPin className="h-4 w-4 text-dv-teal-700" /> Shipping to
              </h2>
              <address className="mt-3 text-sm not-italic leading-relaxed text-dv-ink-soft">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 && (
                  <>
                    <br />
                    {order.shippingAddress.line2}
                  </>
                )}
                <br />
                {order.shippingAddress.city}
                {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
                {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
                {order.shippingAddress.phone && (
                  <>
                    <br />
                    {order.shippingAddress.phone}
                  </>
                )}
              </address>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-dv-line bg-white p-6">
            <h2 className="font-display text-lg text-dv-teal-900">Order progress</h2>
            <div className="mt-5">
              <OrderTimeline status={order.status} timeline={order.timeline ?? []} />
            </div>
          </section>

          {order.trackingNumber && (
            <section className="rounded-2xl border border-dv-line bg-white p-6">
              <h2 className="flex items-center gap-2 font-display text-lg text-dv-teal-900">
                <Truck className="h-4 w-4 text-dv-teal-700" /> Tracking
              </h2>
              <p className="mt-2 break-all font-mono text-sm text-dv-ink">{order.trackingNumber}</p>
            </section>
          )}

          <section className="rounded-2xl bg-dv-teal-900 p-6 text-dv-mint-50">
            <p className="font-display text-lg">Need help with this order?</p>
            <p className="mt-2 text-sm leading-relaxed text-dv-mint-50/75">
              Quote {order.orderNumber} and our support team will pick it up from there.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex rounded-full bg-white/15 px-5 py-2.5 text-sm transition-colors hover:bg-white/25"
            >
              Contact support
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}
