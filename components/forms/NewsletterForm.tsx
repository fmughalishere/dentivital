"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useUI } from "@/context/UIContext";
import Spinner from "@/components/ui/Spinner";

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const { toast } = useUI();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");

      setDone(true);
      setEmail("");
      toast.success(
        data.alreadySubscribed ? "You're already on the list" : "You're subscribed!",
        "We'll send the oral care handbook and new offers to your inbox."
      );
    } catch (err) {
      toast.error("Sign-up failed", err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          aria-label="Email address"
          className="dv-input py-2 text-xs"
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Subscribe"
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-dv-teal-900 text-white transition-colors hover:bg-dv-coral-600 disabled:opacity-60"
        >
          {loading ? <Spinner /> : done ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white/10 p-1.5 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-dv-ink outline-none placeholder:text-dv-ink/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-dv-coral-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-dv-coral-500 disabled:opacity-60"
        >
          {loading ? <Spinner /> : done ? <Check className="h-4 w-4" /> : null}
          {done ? "Subscribed" : "Get the guide"}
        </button>
      </div>
    </form>
  );
}
