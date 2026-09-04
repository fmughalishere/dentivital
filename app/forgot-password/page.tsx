"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, MailCheck } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useUI } from "@/context/UIContext";

export default function ForgotPasswordPage() {
  const { toast } = useUI();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email.split("@")[0],
          email,
          subject: "Password reset request",
          message: `Please help me reset the password for the account ${email}.`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't send the request.");

      setSent(true);
      toast.success("Request sent", "Our support team will email you a reset link.");
    } catch (err) {
      toast.error("Couldn't send request", err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="Tell us the email on your account and our support team will send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="dv-link-underline text-dv-teal-900">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-dv-success/25 bg-dv-success-bg p-6 text-center">
          <MailCheck className="mx-auto h-7 w-7 text-dv-success" />
          <p className="mt-3 font-display text-lg text-dv-teal-900">Request received</p>
          <p className="mt-2 text-sm leading-relaxed text-dv-ink-soft">
            We&apos;ve passed your request to the Dentivital support team. You&apos;ll hear back at{" "}
            <strong className="text-dv-teal-900">{email}</strong> shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            error={error}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="you@example.com"
          />
          <Button type="submit" loading={loading} fullWidth size="lg">
            <KeyRound className="h-4 w-4" /> Send reset request
          </Button>
          <p className="text-center text-xs text-dv-ink-soft">
            Signed up with Google? Just use the Google button on the{" "}
            <Link href="/login" className="dv-link-underline text-dv-teal-900">
              sign-in page
            </Link>
            .
          </p>
        </form>
      )}
    </AuthShell>
  );
}
