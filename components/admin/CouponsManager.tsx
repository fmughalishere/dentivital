"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Percent, Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Field";
import EmptyState from "@/components/ui/EmptyState";
import { useUI } from "@/context/UIContext";
import { formatDate, money } from "@/lib/format";
import type { Coupon } from "@/types";
import { CURRENCY_CODE } from "@/lib/currency";

const BLANK = {
  code: "",
  type: "percent" as "percent" | "fixed",
  value: "10",
  minSubtotal: "0",
  maxRedemptions: "",
  expiresAt: "",
  active: true,
};

export default function CouponsManager({ coupons }: { coupons: Coupon[] }) {
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
    if (!/^[A-Za-z0-9_-]{3,24}$/.test(form.code.trim())) {
      next.code = "3–24 characters: letters, numbers, dashes or underscores.";
    }
    const value = Number(form.value);
    if (!Number.isFinite(value) || value <= 0) next.value = "Enter a value above zero.";
    if (form.type === "percent" && value > 100) next.value = "A percentage can't exceed 100.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim(),
          type: form.type,
          value,
          minSubtotal: Number(form.minSubtotal) || 0,
          maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
          expiresAt: form.expiresAt || null,
          active: form.active,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't create that discount.");

      setOpen(false);
      setForm(BLANK);
      router.refresh();
      toast.success("Discount created", form.code.toUpperCase());
    } catch (err) {
      toast.error("Couldn't create discount", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(coupon: Coupon) {
    try {
      const res = await fetch(`/api/coupons/${coupon._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
      toast.success(coupon.active ? "Discount paused" : "Discount activated", coupon.code);
    } catch {
      toast.error("Couldn't update that discount");
    }
  }

  async function remove(coupon: Coupon) {
    const ok = await confirm({
      title: `Delete ${coupon.code}?`,
      description: "Customers won't be able to use this code again.",
      confirmLabel: "Delete code",
      tone: "danger",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/coupons/${coupon._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
      toast.success("Discount deleted", coupon.code);
    } catch {
      toast.error("Couldn't delete that discount");
    }
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New discount
        </Button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState
          icon={<Percent className="h-5 w-5" />}
          title="No discount codes yet"
          description="Create a code and shoppers can apply it in the cart or at checkout."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> New discount
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-dv-line bg-white">
          <div className="dv-scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-dv-line bg-dv-mint-50 text-left text-xs text-dv-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Discount</th>
                  <th className="px-5 py-3 font-medium">Minimum</th>
                  <th className="px-5 py-3 font-medium">Used</th>
                  <th className="px-5 py-3 font-medium">Expires</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dv-line">
                {coupons.map((coupon) => {
                  const expired =
                    coupon.expiresAt !== null && new Date(coupon.expiresAt).getTime() < Date.now();
                  return (
                    <tr key={coupon._id} className="transition-colors hover:bg-dv-mint-50">
                      <td className="px-5 py-3.5 font-mono font-medium text-dv-teal-900">
                        {coupon.code}
                      </td>
                      <td className="px-5 py-3.5 text-dv-ink">
                        {coupon.type === "percent"
                          ? `${coupon.value}% off`
                          : `${money(coupon.value)} off`}
                      </td>
                      <td className="px-5 py-3.5 text-dv-ink-soft">
                        {coupon.minSubtotal > 0 ? money(coupon.minSubtotal) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-dv-ink-soft">
                        {coupon.timesRedeemed}
                        {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""}
                      </td>
                      <td className="px-5 py-3.5 text-dv-ink-soft">
                        {coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never"}
                      </td>
                      <td className="px-5 py-3.5">
                        {expired ? (
                          <Badge tone="warning">expired</Badge>
                        ) : coupon.active ? (
                          <Badge tone="success">active</Badge>
                        ) : (
                          <Badge tone="neutral">paused</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggle(coupon)}
                            className="rounded-lg px-3 py-1.5 text-xs text-dv-teal-900 transition-colors hover:bg-dv-mint-100"
                          >
                            {coupon.active ? "Pause" : "Activate"}
                          </button>
                          <button
                            onClick={() => remove(coupon)}
                            aria-label={`Delete ${coupon.code}`}
                            className="rounded-lg p-2 text-dv-ink-soft transition-colors hover:bg-dv-danger-bg hover:text-dv-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New discount code"
        description="Shoppers enter this code in the cart or at checkout."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={create} loading={saving}>
              Create discount
            </Button>
          </>
        }
      >
        <form onSubmit={create} className="grid gap-4" noValidate>
          <Input
            label="Code"
            required
            value={form.code}
            error={errors.code}
            onChange={(e) => update("code", e.target.value.toUpperCase())}
            placeholder="WHITEN20"
            className="font-mono uppercase"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => update("type", e.target.value as "percent" | "fixed")}
            >
              <option value="percent">Percentage off</option>
              <option value="fixed">Fixed amount off</option>
            </Select>
            <Input
              label={form.type === "percent" ? "Percent off" : `Amount off (${CURRENCY_CODE})`}
              required
              type="number"
              step={form.type === "percent" ? "1" : "0.01"}
              min="0"
              value={form.value}
              error={errors.value}
              onChange={(e) => update("value", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Minimum subtotal"
              type="number"
              step="0.01"
              min="0"
              value={form.minSubtotal}
              onChange={(e) => update("minSubtotal", e.target.value)}
              hint="0 means no minimum."
            />
            <Input
              label="Max redemptions"
              type="number"
              min="1"
              value={form.maxRedemptions}
              onChange={(e) => update("maxRedemptions", e.target.value)}
              placeholder="Unlimited"
            />
          </div>
          <Input
            label="Expires on"
            type="date"
            value={form.expiresAt}
            onChange={(e) => update("expiresAt", e.target.value)}
            hint="Leave blank for no expiry."
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-dv-ink">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
              className="h-4 w-4 accent-dv-teal-700"
            />
            Active straight away
          </label>
        </form>
      </Modal>
    </>
  );
}
