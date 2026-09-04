"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import Button from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import type { AppUser } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, refresh } = useAuth();
  const { toast } = useUI();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function nextUrl() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    return next && next.startsWith("/") ? next : null;
  }

  function afterAuth(user: AppUser) {
    setUser(user);
    toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
    router.push(nextUrl() ?? (user.role === "admin" ? "/admin" : "/account"));
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Sign-in failed.");

      await refresh();
      afterAuth(data.user as AppUser);
    } catch (err) {
      toast.error("Couldn't sign you in", err instanceof Error ? err.message : undefined);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Track orders, save addresses and check out faster."
      footer={
        <>
          New to Dentivital?{" "}
          <Link href="/register" className="dv-link-underline text-dv-teal-900">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((x) => ({ ...x, email: "" }));
          }}
          placeholder="you@example.com"
        />

        <div>
          <PasswordInput
            autoComplete="current-password"
            required
            value={password}
            error={errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((x) => ({ ...x, password: "" }));
            }}
            placeholder="••••••••"
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs text-dv-ink-soft hover:text-dv-coral-600">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg">
          <LogIn className="h-4 w-4" /> Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-dv-line" />
        <span className="text-[11px] uppercase tracking-wider text-dv-ink-soft">or</span>
        <span className="h-px flex-1 bg-dv-line" />
      </div>

      <GoogleSignInButton onSuccess={afterAuth} label="signin_with" />
    </AuthShell>
  );
}
