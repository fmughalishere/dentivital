import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { OrderStatusBadge } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { getSession } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data";
import { formatDate, money } from "@/lib/format";

export const metadata: Metadata = { title: "My orders" };

export default async function AccountOrdersPage() {
  const session = await getSession();
  const orders = session ? await getOrdersForUser(session.id) : [];

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Orders</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">My orders</h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          Follow every order from payment through to delivery.
        </p>
      </header>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="No orders yet"
          description="When you place your first order it will show up here."
          action={
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-dv-teal-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-dv-coral-600"
            >
              Shop products
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order._id}>
              <Link
                href={`/account/orders/${order._id}`}
                className="group block rounded-2xl border border-dv-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg text-dv-teal-900">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-dv-ink-soft">
                      Placed {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-display text-lg text-dv-teal-900">
                      {money(order.total)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-dv-ink-soft transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-dv-line pt-4">
                  {order.items.slice(0, 4).map((item) => (
                    <span
                      key={item.productId}
                      className="relative h-12 w-12 overflow-hidden rounded-lg bg-dv-mint-100"
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      )}
                    </span>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs text-dv-ink-soft">
                      +{order.items.length - 4} more
                    </span>
                  )}
                  {order.trackingNumber && (
                    <span className="ml-auto text-xs text-dv-ink-soft">
                      Tracking: <span className="text-dv-teal-900">{order.trackingNumber}</span>
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
