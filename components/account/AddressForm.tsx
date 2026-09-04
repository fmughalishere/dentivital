"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import type { AppUser } from "@/types";

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Ireland",
  "New Zealand",
  "Germany",
  "France",
  "Netherlands",
  "United Arab Emirates",
  "Pakistan",
];

export default function AddressForm({ user }: { user: AppUser }) {
  const { refresh } = useAuth();
  const { toast } = useUI();
  const router = useRouter();

  const [address, setAddress] = useState({
    fullName: user.address?.fullName ?? user.name ?? "",
    line1: user.address?.line1 ?? "",
    line2: user.address?.line2 ?? "",
    city: user.address?.city ?? "",
    state: user.address?.state ?? "",
    postalCode: user.address?.postalCode ?? "",
    country: user.address?.country ?? "United States",
    phone: user.address?.phone ?? user.phone ?? "",
  });
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof address, value: string) {
    setAddress((a) => ({ ...a, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't save your address.");

      await refresh();
      router.refresh();
      toast.success("Address saved", "We'll prefill this at checkout next time.");
    } catch (err) {
      toast.error("Couldn't save address", err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <Input
        label="Recipient name"
        value={address.fullName}
        onChange={(e) => update("fullName", e.target.value)}
      />
      <Input
        label="Address line 1"
        value={address.line1}
        onChange={(e) => update("line1", e.target.value)}
        placeholder="123 Maple Street"
      />
      <Input
        label="Address line 2"
        value={address.line2}
        onChange={(e) => update("line2", e.target.value)}
        placeholder="Apartment, suite (optional)"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="City" value={address.city} onChange={(e) => update("city", e.target.value)} />
        <Input
          label="State / Region"
          value={address.state}
          onChange={(e) => update("state", e.target.value)}
        />
        <Input
          label="Postal code"
          value={address.postalCode}
          onChange={(e) => update("postalCode", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Country"
          value={address.country}
          onChange={(e) => update("country", e.target.value)}
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input label="Phone" value={address.phone} onChange={(e) => update("phone", e.target.value)} />
      </div>
      <div>
        <Button type="submit" loading={loading}>
          <Save className="h-4 w-4" /> Save address
        </Button>
      </div>
    </form>
  );
}
