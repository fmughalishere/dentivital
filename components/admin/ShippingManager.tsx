"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Truck } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Input } from "@/components/ui/Field";
import EmptyState from "@/components/ui/EmptyState";
import { useUI } from "@/context/UIContext";
import { money } from "@/lib/format";
import type { ShippingRate } from "@/types";
import { CURRENCY_CODE } from "@/lib/currency";

const BLANK = {
  label: "",
  description: "",
  price: "4.95",
  minDays: "4",
  maxDays: "7",
  freeOver: "",
  sortOrder: "0",
  active: true,
};

export default function ShippingManager({ rates }: { rates: ShippingRate[] }) {
  const router = useRouter();
  const { toast, confirm } = useUI();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof BLANK>(key: K, value: (typeof BLANK)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key as string]: "" }));
  }

  async function create(e?: React.SyntheticEvent) {
    e?.preventDefault();
    if (saving) return;

    const next: Record<string, string> = {};
    if (form.label.trim().length < 2) next.label = "Give this method a name.";
    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      next.price = "Enter a valid price.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          minDays: Number(form.minDays) || 0,
          maxDays: Number(form.maxDays) || 0,
          freeOver: form.freeOver ? Number(form.freeOver) : null,
          sortOrder: Number(form.sortOrder) || 0,
          active: form.active,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't create that rate.");

      setOpen(false);
      setForm(BLANK);
      router.refresh();
      toast.success("Shipping method added", form.label);
    } catch (err) {
      toast.error("Couldn't add method", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(rate: ShippingRate) {
    try {
      const res = await fetch(`/api/shipping/${rate._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !rate.active }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
      toast.success(rate.active ? "Method hidden" : "Method enabled", rate.label);
    } catch {
      toast.error("Couldn't update that method");
    }
  }

  async function remove(rate: ShippingRate) {
    const ok = await confirm({
      title: `Delete ${rate.label}?`,
      description: "Shoppers will no longer see this option at checkout.",
      confirmLabel: "Delete method",
      tone: "danger",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/shipping/${rate._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
      toast.success("Method deleted", rate.label);
    } catch {
      toast.error("Couldn't delete that method");
    }
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New method
        </Button>
      </div>

      {rates.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-5 w-5" />}
          title="No shipping methods"
          description="Add at least one method so customers can complete checkout."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> New method
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rates.map((rate) => (
            <li key={rate._id} className="rounded-2xl border border-dv-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-lg text-dv-teal-900">{rate.label}</p>
                  <p className="mt-1 text-xs text-dv-ink-soft">
                    {rate.description || `Arrives in ${rate.minDays}–${rate.maxDays} business days.`}
                  </p>
                </div>
                {rate.active ? <Badge tone="success">active</Badge> : <Badge>hidden</Badge>}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-dv-line pt-4 text-sm">
                <div>
                  <dt className="text-xs text-dv-ink-soft">Price</dt>
                  <dd className="font-medium text-dv-teal-900">
                    {rate.price === 0 ? "Free" : money(rate.price)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-dv-ink-soft">Free over</dt>
                  <dd className="font-medium text-dv-teal-900">
                    {rate.freeOver !== null ? money(rate.freeOver) : "—"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggle(rate)}
                  className="rounded-full border border-dv-line-strong px-4 py-2 text-xs text-dv-teal-900 transition-colors hover:bg-dv-mint-100"
                >
                  {rate.active ? "Hide from checkout" : "Show at checkout"}
                </button>
                <button
                  onClick={() => remove(rate)}
                  aria-label={`Delete ${rate.label}`}
                  className="rounded-lg p-2 text-dv-ink-soft transition-colors hover:bg-dv-danger-bg hover:text-dv-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New shipping method"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={create} loading={saving}>
              Add method
            </Button>
          </>
        }
      >
        <form onSubmit={create} className="grid gap-4" noValidate>
          <Input
            label="Name"
            required
            value={form.label}
            error={errors.label}
            onChange={(e) => update("label", e.target.value)}
            placeholder="Express Shipping"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Priority handling, arrives in 2–3 business days."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label={`Price (${CURRENCY_CODE})`}
              required
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              error={errors.price}
              onChange={(e) => update("price", e.target.value)}
            />
            <Input
              label="Min days"
              type="number"
              min="0"
              value={form.minDays}
              onChange={(e) => update("minDays", e.target.value)}
            />
            <Input
              label="Max days"
              type="number"
              min="0"
              value={form.maxDays}
              onChange={(e) => update("maxDays", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={`Free over (${CURRENCY_CODE})`}
              type="number"
              step="0.01"
              min="0"
              value={form.freeOver}
              onChange={(e) => update("freeOver", e.target.value)}
              placeholder="Never free"
            />
            <Input
              label="Sort order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", e.target.value)}
              hint="Lower numbers show first."
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-dv-ink">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
              className="h-4 w-4 accent-dv-teal-700"
            />
            Show at checkout
          </label>
        </form>
      </Modal>
    </>
  );
}
