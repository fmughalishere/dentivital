import type { Metadata } from "next";
import OrdersTable from "@/components/admin/OrdersTable";
import { getAllOrders } from "@/lib/data";

export const metadata: Metadata = { title: "Orders · Admin" };

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Fulfilment</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">Orders</h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          Search, filter and update the status of every order.
        </p>
      </header>

      <OrdersTable orders={orders} />
    </>
  );
}
