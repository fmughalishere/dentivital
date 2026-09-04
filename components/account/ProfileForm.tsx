"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import type { AppUser } from "@/types";

export default function ProfileForm({ user }: { user: AppUser }) {
  const { refresh } = useAuth();
  const { toast } = useUI();
  const router = useRouter();

  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (name.trim().length < 2) {
      setErrors({ name: "Enter your full name." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't save your changes.");

      await refresh();
      router.refresh();
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Update failed", err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Input
        label="Full name"
        required
        value={name}
        error={errors.name}
        onChange={(e) => {
          setName(e.target.value);
          setErrors({});
        }}
      />
      <Input
        label="Email"
        value={user.email}
        disabled
        hint="Your email is used to sign in and can't be changed here."
      />
      <Input
        label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="For delivery updates"
      />
      <Input
        label="Sign-in method"
        value={user.provider === "google" ? "Google account" : "Email and password"}
        disabled
      />
      <div className="sm:col-span-2">
        <Button type="submit" loading={loading}>
          <Save className="h-4 w-4" /> Save changes
        </Button>
      </div>
    </form>
  );
}
