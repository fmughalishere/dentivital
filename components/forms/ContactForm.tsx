"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { useUI } from "@/context/UIContext";

const EMPTY = { name: "", email: "", subject: "", message: "" };

export default function ContactForm() {
  const { toast } = useUI();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(key: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Please tell us your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Please enter a valid email address.";
    if (form.message.trim().length < 10) next.message = "Please write at least a sentence or two.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");

      setForm(EMPTY);
      toast.success("Message sent", "Our team usually replies within one business day.");
    } catch (err) {
      toast.error("Couldn't send message", err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Your name"
          required
          value={form.name}
          error={errors.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Jane Cooper"
        />
        <Input
          label="Your email"
          type="email"
          required
          value={form.email}
          error={errors.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="jane@example.com"
        />
      </div>
      <Input
        label="Subject"
        value={form.subject}
        onChange={(e) => update("subject", e.target.value)}
        placeholder="Question about the 42 PCs strips"
      />
      <Textarea
        label="Your message"
        required
        rows={5}
        value={form.message}
        error={errors.message}
        onChange={(e) => update("message", e.target.value)}
        placeholder="How can we help?"
      />
      <div>
        <Button type="submit" loading={loading} size="lg">
          <Send className="h-4 w-4" /> Send message
        </Button>
      </div>
    </form>
  );
}
