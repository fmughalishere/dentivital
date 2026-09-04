import type { Metadata } from "next";
import MessagesInbox from "@/components/admin/MessagesInbox";
import { getMessages, getSubscribers } from "@/lib/data";

export const metadata: Metadata = { title: "Inbox · Admin" };

export default async function AdminMessagesPage() {
  const [messages, subscribers] = await Promise.all([getMessages(), getSubscribers()]);

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Support</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">Inbox</h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          Contact-form enquiries and newsletter sign-ups in one place.
        </p>
      </header>

      <MessagesInbox messages={messages} subscribers={subscribers} />
    </>
  );
}
