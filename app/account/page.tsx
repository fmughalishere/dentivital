import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Package, ShoppingBag, Truck, Wallet } from "lucide-react";
import { OrderStatusBadge } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { getSession } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data";
import { formatDate, money } from "@/lib/format";

export const metadata: Metadata = { title: "My account" };

export default async function AccountOverviewPage() {
  const session = await getSession();
  const orders = session ? await getOrdersForUser(session.id) : [];

  const paid = orders.filter((o) => o.paymentStatus === "paid");
  const spent = paid.reduce((sum, o) => sum + o.total, 0);
  const inTransit = orders.filter((o) => ["paid", "processing", "shipped"].includes(o.status));

  const stats = [
    { Icon: ShoppingBag, label: "Total orders", value: String(orders.length) },
    { Icon: Truck, label: "In progress", value: String(inTransit.length) },
    { Icon: Wallet, label: "Lifetime spend", value: money(spent) },
  ];

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Overview</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">
          Hello, {session?.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          Here&apos;s what&apos;s happening with your Dentivital orders.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-dv-line bg-white p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dv-mint-100 text-dv-teal-700">
              <Icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xs text-dv-ink-soft">{label}</p>
            <p className="mt-0.5 font-display text-2xl text-dv-teal-900">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-dv-teal-900">Recent orders</h2>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="dv-link-underline group flex items-center gap-1.5 text-sm text-dv-teal-900"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-5 w-5" />}
            title="No orders yet"
            description="Once you place an order it will appear here with live status updates."
            action={
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-dv-teal-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-dv-coral-600"
              >
                Start shopping
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-dv-line overflow-hidden rounded-2xl border border-dv-line bg-white">
            {orders.slice(0, 5).map((order) => (
              <li key={order._id}>
                <Link
                  href={`/account/orders/${order._id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-5 transition-colors hover:bg-dv-mint-50"
                >
                  <div className="min-w-0">
                    <p className="font-display text-base text-dv-teal-900">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-dv-ink-soft">
                      {formatDate(order.createdAt)} ·{" "}
                      {order.items.reduce((n, i) => n + i.quantity, 0)} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-display text-base text-dv-teal-900">
                      {money(order.total)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
