import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { SUPPORT_IMAGE } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Questions about Dentivital whitening strips? Message our customer support team — we usually reply within one business day.",
};

const CHANNELS = [
  { Icon: Phone, label: "Phone", value: "+92 310 0404444 ", href: "tel:+923100404444" },
  {
    Icon: Mail,
    label: "Email",
    value: "dentivitalinc@gmail.com",
    href: "mailto:dentivitalinc@gmail.com",
  },
  { Icon: Clock, label: "Support hours", value: "Mon–Fri, 9am–6pm" },
  { Icon: MapPin, label: "Shipping", value: "Worldwide, tracked delivery" },
];

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-dv-line bg-gradient-to-br from-dv-mint-100 to-dv-mint-50 py-14">
        <div className="dv-container max-w-3xl">
          <p className="eyebrow text-dv-coral-600">Contact Us</p>
          <h1 className="mt-3 font-display text-4xl text-dv-teal-900 sm:text-5xl">
            Pop in, drop us a line
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-dv-ink-soft sm:text-base">
            Ask our customer support team anything — about your order, your routine, or which
            treatment suits your teeth best.
          </p>
        </div>
      </section>

      <section className="dv-container grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[1.75rem] border border-dv-line bg-white p-7 sm:p-9">
          <h2 className="font-display text-2xl text-dv-teal-900">Send us a message</h2>
          <p className="mt-2 text-sm text-dv-ink-soft">
            Fill in the form and we&apos;ll get back to you shortly.
          </p>
          <div className="mt-7">
            <ContactForm />
          </div>
        </div>

        <aside className="space-y-4">
          {CHANNELS.map(({ Icon, label, value, href }) => (
            <div
              key={label}
              className="flex items-start gap-3.5 rounded-2xl border border-dv-line bg-white p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dv-mint-100 text-dv-teal-700">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-dv-ink-soft">{label}</p>
                {href ? (
                  <a
                    href={href}
                    className="dv-link-underline break-words text-sm text-dv-teal-900"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-dv-teal-900">{value}</p>
                )}
              </div>
            </div>
          ))}

          <div className="overflow-hidden rounded-2xl bg-dv-teal-900 text-dv-mint-50">
            <div className="p-6">
              <MessageCircle className="h-5 w-5 text-dv-coral-500" />
              <p className="mt-3 font-display text-lg">Need help choosing?</p>
              <p className="mt-2 text-sm leading-relaxed text-dv-mint-50/75">
                Tell us about your sensitivity and staining and we&apos;ll recommend the right
                treatment length for you.
              </p>
            </div>
            <div className="relative h-56 w-full">
              <Image
                src={SUPPORT_IMAGE}
                alt="Dentivital customer support"
                fill
                sizes="(max-width: 1024px) 100vw, 340px"
                className="object-contain object-bottom"
              />
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
