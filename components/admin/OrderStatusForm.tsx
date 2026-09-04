"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { useUI } from "@/context/UIContext";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/types";

export default function OrderStatusForm({ order }: { order: Order }) {
  const router = useRouter();
  const { toast, confirm } = useUI();

  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    // Cancelling or refunding is hard to undo, so ask first.
    if (status !== order.status && (status === "cancelled" || status === "refunded")) {
      const ok = await confirm({
        title: `Mark ${order.orderNumber} as ${status}?`,
        description:
          status === "refunded"
            ? "Record this order as refunded. Issue the actual refund in Stripe separately."
            : "The customer will see this order as cancelled.",
        confirmLabel: `Yes, mark ${status}`,
        tone: "danger",
      });
      if (!ok) return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: tracking.trim() || null,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't update this order.");

      setNote("");
      router.refresh();
      toast.success("Order updated", `${order.orderNumber} is now ${status}.`);
    } catch (err) {
      toast.error("Update failed", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-4">
      <Select
        label="Order status"
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="capitalize"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <Input
        label="Tracking number"
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        placeholder="Shown to the customer once added"
      />

      <Textarea
        label="Internal note"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note added to the order timeline"
      />

      <Button type="submit" loading={saving} fullWidth>
        <Save className="h-4 w-4" /> Save order
      </Button>
    </form>
  );
}
