"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Faq } from "@/types";

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?._id ?? null);

  return (
    <div className="divide-y divide-dv-line overflow-hidden rounded-2xl border border-dv-line bg-white">
      {faqs.map((faq) => {
        const isOpen = openId === faq._id;
        return (
          <div key={faq._id}>
            <h3>
              <button
                onClick={() => setOpenId(isOpen ? null : faq._id)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${faq._id}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-dv-mint-50 sm:px-6"
              >
                <span className="font-display text-base text-dv-teal-900 sm:text-lg">
                  {faq.question}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isOpen ? "rotate-45 bg-dv-coral-600 text-white" : "bg-dv-mint-100 text-dv-teal-700"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            </h3>
            <div
              id={`faq-panel-${faq._id}`}
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-dv-ink-soft sm:px-6">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
