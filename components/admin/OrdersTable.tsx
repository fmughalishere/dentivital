"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Receipt, Search } from "lucide-react";
import { OrderStatusBadge } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate, money } from "@/lib/format";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/types";

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const matchesTerm =
        !term ||
        order.orderNumber.toLowerCase().includes(term) ||
        order.email.toLowerCase().includes(term) ||
        order.customerName?.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [orders, query, status]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of orders) map.set(order.status, (map.get(order.status) ?? 0) + 1);
    return map;
  }, [orders]);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dv-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order number or email"
            aria-label="Search orders"
            className="dv-input pl-10"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus | "all")}
          aria-label="Filter by status"
          className="dv-input w-auto cursor-pointer capitalize"
        >
          <option value="all">All statuses ({orders.length})</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s} ({counts.get(s) ?? 0})
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-5 w-5" />}
          title={orders.length === 0 ? "No orders yet" : "No orders match those filters"}
          description={
            orders.length === 0
              ? "Orders appear here the moment a customer completes checkout."
              : "Try clearing the search or choosing a different status."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-dv-line bg-white">
          <div className="dv-scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-dv-line bg-dv-mint-50 text-left text-xs text-dv-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-dv-line">
                {visible.map((order) => (
                  <tr key={order._id} className="transition-colors hover:bg-dv-mint-50">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="font-medium text-dv-teal-900 hover:text-dv-coral-600"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="block text-xs text-dv-ink-soft">
                        {order.items.reduce((n, i) => n + i.quantity, 0)} item(s)
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="block text-dv-ink">{order.customerName || "—"}</span>
                      <span className="block text-xs text-dv-ink-soft">{order.email}</span>
                    </td>
                    <td className="px-5 py-3.5 text-dv-ink-soft">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={
                          order.paymentStatus === "paid"
                            ? "text-dv-success"
                            : order.paymentStatus === "refunded"
                              ? "text-dv-ink-soft"
                              : "text-dv-warning"
                        }
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-dv-teal-900">
                      {money(order.total)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        aria-label={`Open ${order.orderNumber}`}
                        className="inline-flex rounded-lg p-2 text-dv-ink-soft transition-colors hover:bg-dv-mint-100 hover:text-dv-teal-900"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
