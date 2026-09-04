"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import type { AppUser } from "@/types";

export default function SettingsPanel({ user }: { user: AppUser }) {
  const { refresh, signOut } = useAuth();
  const { toast, confirm } = useUI();
  const router = useRouter();

  const hasPassword = user.provider === "password";

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingPw, setSavingPw] = useState(false);

  const [marketing, setMarketing] = useState(Boolean(user.marketingOptIn));
  const [savingPref, setSavingPref] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (savingPw) return;

    const problems: Record<string, string> = {};
    if (hasPassword && !current) problems.current = "Enter your current password.";
    if (next.length < 8) problems.next = "Use at least 8 characters.";
    if (next !== confirmPw) problems.confirm = "Passwords don't match.";
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;

    setSavingPw(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current || undefined, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't update your password.");

      setCurrent("");
      setNext("");
      setConfirmPw("");
      toast.success(hasPassword ? "Password updated" : "Password set", "Use it next time you sign in.");
      router.refresh();
    } catch (err) {
      toast.error("Couldn't update password", err instanceof Error ? err.message : undefined);
    } finally {
      setSavingPw(false);
    }
  }

  async function savePreferences(value: boolean) {
    setMarketing(value);
    setSavingPref(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingOptIn: value }),
      });
      if (!res.ok) throw new Error();
      await refresh();
      toast.success(value ? "Subscribed to emails" : "Unsubscribed from emails");
    } catch {
      setMarketing(!value);
      toast.error("Couldn't save that preference");
    } finally {
      setSavingPref(false);
    }
  }

  async function handleSignOut() {
    const ok = await confirm({
      title: "Sign out of this device?",
      description: "You'll need your password or Google account to sign back in.",
      confirmLabel: "Sign out",
    });
    if (!ok) return;
    await signOut();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-dv-line bg-white p-6">
        <h2 className="flex items-center gap-2 font-display text-lg text-dv-teal-900">
          <KeyRound className="h-4 w-4 text-dv-teal-700" />
          {hasPassword ? "Change password" : "Set a password"}
        </h2>
        <p className="mt-1 text-sm text-dv-ink-soft">
          {hasPassword
            ? "Use at least 8 characters. A mix of letters, numbers and symbols is strongest."
            : "You signed up with Google. Set a password if you'd also like to sign in with email."}
        </p>

        <form onSubmit={changePassword} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
          {hasPassword && (
            <PasswordInput
              label="Current password"
              autoComplete="current-password"
              value={current}
              error={errors.current}
              onChange={(e) => setCurrent(e.target.value)}
              wrapperClassName="sm:col-span-2"
            />
          )}
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            value={next}
            error={errors.next}
            onChange={(e) => setNext(e.target.value)}
          />
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            value={confirmPw}
            error={errors.confirm}
            onChange={(e) => setConfirmPw(e.target.value)}
          />
          <div className="sm:col-span-2">
            <Button type="submit" loading={savingPw}>
              {hasPassword ? "Update password" : "Set password"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-dv-line bg-white p-6">
        <h2 className="flex items-center gap-2 font-display text-lg text-dv-teal-900">
          <Mail className="h-4 w-4 text-dv-teal-700" /> Email preferences
        </h2>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-dv-mint-50 p-4">
          <input
            type="checkbox"
            checked={marketing}
            disabled={savingPref}
            onChange={(e) => savePreferences(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-dv-teal-700"
          />
          <span>
            <span className="block text-sm font-medium text-dv-teal-900">
              Oral care tips and offers
            </span>
            <span className="block text-xs text-dv-ink-soft">
              Occasional emails about new products and member-only discounts.
            </span>
          </span>
        </label>
      </section>

      <section className="rounded-2xl border border-dv-line bg-white p-6">
        <h2 className="font-display text-lg text-dv-teal-900">Session</h2>
        <p className="mt-1 text-sm text-dv-ink-soft">
          Signing out clears your session on this device. Your cart stays saved locally.
        </p>
        <Button variant="outline" className="mt-4" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </section>
    </div>
  );
}
