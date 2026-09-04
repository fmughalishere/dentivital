"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail, Trash2, Undo2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useUI } from "@/context/UIContext";
import { formatDateTime } from "@/lib/format";
import type { ContactMessage, Subscriber } from "@/types";

export default function MessagesInbox({
  messages,
  subscribers,
}: {
  messages: ContactMessage[];
  subscribers: Subscriber[];
}) {
  const router = useRouter();
  const { toast, confirm } = useUI();
  const [tab, setTab] = useState<"messages" | "subscribers">("messages");

  async function setHandled(message: ContactMessage, handled: boolean) {
    try {
      const res = await fetch(`/api/admin/messages/${message._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handled }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
      toast.success(handled ? "Marked as handled" : "Reopened", message.email);
    } catch {
      toast.error("Couldn't update that message");
    }
  }

  async function remove(message: ContactMessage) {
    const ok = await confirm({
      title: "Delete this message?",
      description: `From ${message.email}. This can't be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/messages/${message._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
      toast.success("Message deleted");
    } catch {
      toast.error("Couldn't delete that message");
    }
  }

  const open = messages.filter((m) => !m.handled).length;

  return (
    <>
      <div className="mb-6 inline-flex rounded-full border border-dv-line bg-white p-1">
        <button
          onClick={() => setTab("messages")}
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
            tab === "messages" ? "bg-dv-teal-900 text-white" : "text-dv-ink-soft hover:text-dv-teal-900"
          }`}
        >
          Messages{open > 0 ? ` (${open})` : ""}
        </button>
        <button
          onClick={() => setTab("subscribers")}
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
            tab === "subscribers"
              ? "bg-dv-teal-900 text-white"
              : "text-dv-ink-soft hover:text-dv-teal-900"
          }`}
        >
          Subscribers ({subscribers.length})
        </button>
      </div>

      {tab === "messages" ? (
        messages.length === 0 ? (
          <EmptyState
            icon={<Mail className="h-5 w-5" />}
            title="No messages yet"
            description="Enquiries from the contact form land here."
          />
        ) : (
          <ul className="space-y-4">
            {messages.map((message) => (
              <li
                key={message._id}
                className={`rounded-2xl border bg-white p-5 ${
                  message.handled ? "border-dv-line opacity-75" : "border-dv-coral-500/30"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-dv-teal-900">
                      {message.name}
                      {message.subject ? (
                        <span className="text-dv-ink-soft"> · {message.subject}</span>
                      ) : null}
                    </p>
                    <a
                      href={`mailto:${message.email}`}
                      className="dv-link-underline text-xs text-dv-ink-soft"
                    >
                      {message.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    {message.handled ? (
                      <Badge tone="success">handled</Badge>
                    ) : (
                      <Badge tone="warning">new</Badge>
                    )}
                    <span className="text-xs text-dv-ink-soft">
                      {formatDateTime(message.createdAt)}
                    </span>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-dv-ink-soft">
                  {message.message}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dv-line pt-4">
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(
                      `Re: ${message.subject || "Your Dentivital enquiry"}`
                    )}`}
                    className="rounded-full bg-dv-teal-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-dv-coral-600"
                  >
                    Reply by email
                  </a>
                  <button
                    onClick={() => setHandled(message, !message.handled)}
                    className="flex items-center gap-1.5 rounded-full border border-dv-line-strong px-4 py-2 text-xs text-dv-teal-900 transition-colors hover:bg-dv-mint-100"
                  >
                    {message.handled ? (
                      <>
                        <Undo2 className="h-3.5 w-3.5" /> Reopen
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" /> Mark handled
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => remove(message)}
                    aria-label="Delete message"
                    className="ml-auto rounded-lg p-2 text-dv-ink-soft transition-colors hover:bg-dv-danger-bg hover:text-dv-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : subscribers.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-5 w-5" />}
          title="No subscribers yet"
          description="Newsletter sign-ups from the homepage and footer collect here."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-dv-line bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-dv-line bg-dv-mint-50 text-left text-xs text-dv-ink-soft">
              <tr>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 text-right font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dv-line">
              {subscribers.map((subscriber) => (
                <tr key={subscriber._id}>
                  <td className="px-5 py-3.5 text-dv-ink">{subscriber.email}</td>
                  <td className="px-5 py-3.5 text-right text-dv-ink-soft">
                    {formatDateTime(subscriber.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
