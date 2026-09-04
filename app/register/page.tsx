"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import Button from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import type { AppUser } from "@/types";

function scorePassword(value: string) {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(score, 4);
}

const STRENGTH = [
  { label: "Too short", color: "bg-dv-danger" },
  { label: "Weak", color: "bg-dv-danger" },
  { label: "Fair", color: "bg-dv-warning" },
  { label: "Good", color: "bg-dv-teal-500" },
  { label: "Strong", color: "bg-dv-success" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, refresh } = useAuth();
  const { toast } = useUI();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => scorePassword(form.password), [form.password]);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function afterAuth(user: AppUser) {
    setUser(user);
    toast.success(`Welcome, ${user.name.split(" ")[0]}!`, "Your Dentivital account is ready.");
    router.push(user.role === "admin" ? "/admin" : "/account");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.confirm !== form.password) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          marketingOptIn,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't create your account.");

      await refresh();
      afterAuth(data.user as AppUser);
    } catch (err) {
      toast.error("Sign-up failed", err instanceof Error ? err.message : undefined);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      subtitle="It takes less than a minute — and checkout gets faster every time."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="dv-link-underline text-dv-teal-900">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Full name"
          autoComplete="name"
          required
          value={form.name}
          error={errors.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Jane Cooper"
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          error={errors.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
        />

        <div>
          <PasswordInput
            autoComplete="new-password"
            required
            value={form.password}
            error={errors.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="At least 8 characters"
          />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1 flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-full flex-1 rounded-full transition-colors ${
                      i < strength ? STRENGTH[strength].color : "bg-dv-line"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-dv-ink-soft">{STRENGTH[strength].label}</span>
            </div>
          )}
        </div>

        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          required
          value={form.confirm}
          error={errors.confirm}
          onChange={(e) => update("confirm", e.target.value)}
          placeholder="Re-enter your password"
        />

        <label className="flex cursor-pointer items-start gap-2.5 text-xs text-dv-ink-soft">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-dv-teal-700"
          />
          Email me oral care tips and member-only offers. You can unsubscribe any time.
        </label>

        <Button type="submit" loading={loading} fullWidth size="lg">
          <UserPlus className="h-4 w-4" /> Create account
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-dv-line" />
        <span className="text-[11px] uppercase tracking-wider text-dv-ink-soft">or</span>
        <span className="h-px flex-1 bg-dv-line" />
      </div>

      <GoogleSignInButton onSuccess={afterAuth} label="signup_with" />
    </AuthShell>
  );
}
