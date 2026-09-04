import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Package,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { OrderStatusBadge } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { getAllOrders, getDashboardStats } from "@/lib/data";
import { formatDate, money } from "@/lib/format";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  const [stats, orders] = await Promise.all([getDashboardStats(), getAllOrders()]);
  const recent = orders.slice(0, 6);

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">Store at a glance</h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          Live numbers from your Stripe payments and product catalogue.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Paid revenue"
          value={money(stats.revenue)}
          hint={`${stats.paidOrders} paid order(s)`}
          tone="success"
        />
        <StatCard
          icon={Receipt}
          label="Total orders"
          value={String(stats.orders)}
          hint={`${stats.pendingOrders} awaiting payment`}
        />
        <StatCard
          icon={TrendingUp}
          label="Average order"
          value={money(stats.averageOrderValue)}
          tone="coral"
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={String(stats.customers)}
          hint={`${stats.products} products live`}
        />
      </div>

      {stats.lowStock > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-dv-warning/25 bg-dv-warning-bg p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-dv-warning" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-dv-warning">
              {stats.lowStock} product{stats.lowStock === 1 ? "" : "s"} running low
            </p>
            <p className="mt-0.5 text-xs text-dv-warning/85">
              Stock is at or below 10 units. Restock before they sell out.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-medium text-dv-warning"
          >
            Review
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <RevenueChart data={stats.revenueByDay} />

        <div className="rounded-2xl border border-dv-line bg-white p-6">
          <h2 className="font-display text-lg text-dv-teal-900">Top products</h2>
          {stats.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-dv-ink-soft">No paid orders yet.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {stats.topProducts.map((product, i) => (
                <li key={product.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-dv-mint-100 text-xs font-medium text-dv-teal-900">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-dv-teal-900">{product.name}</span>
                    <span className="block text-xs text-dv-ink-soft">
                      {product.quantity} sold
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-dv-teal-900">
                    {money(product.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-dv-teal-900">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="dv-link-underline group flex items-center gap-1.5 text-sm text-dv-teal-900"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={<Package className="h-5 w-5" />}
            title="No orders yet"
            description="Orders will appear here as soon as the first customer checks out."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-dv-line bg-white">
            <div className="dv-scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-dv-line bg-dv-mint-50 text-left text-xs text-dv-ink-soft">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dv-line">
                  {recent.map((order) => (
                    <tr key={order._id} className="transition-colors hover:bg-dv-mint-50">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="font-medium text-dv-teal-900 hover:text-dv-coral-600"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-dv-ink-soft">{order.email}</td>
                      <td className="px-5 py-3.5 text-dv-ink-soft">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-dv-teal-900">
                        {money(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
