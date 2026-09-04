import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { LOGO } from "@/lib/assets";

const PERKS = [
  { Icon: Sparkles, text: "Track every order from your dashboard" },
  { Icon: Truck, text: "Faster checkout with saved addresses" },
  { Icon: ShieldCheck, text: "Member-only discounts and early drops" },
];

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="dv-container grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
      {/* Brand panel */}
      <aside className="order-2 hidden overflow-hidden rounded-[2rem] bg-dv-teal-900 p-10 text-dv-mint-50 lg:order-1 lg:block">
        <div className="relative h-8 w-[140px]">
          <Image
            src={LOGO}
            alt="Dentivital"
            fill
            sizes="140px"
            className="object-contain object-left brightness-0 invert"
          />
        </div>
        <h2 className="mt-10 font-display text-3xl leading-snug">
          Triple action, zero sensitivity — and a smile that keeps getting healthier.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-dv-mint-50/70">
          Join 100,000+ people who whiten without the sting, while restoring enamel and improving
          gum health.
        </p>
        <ul className="mt-9 space-y-4">
          {PERKS.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-dv-mint-50/85">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon className="h-4 w-4 text-dv-coral-500" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </aside>

      {/* Form panel */}
      <div className="order-1 mx-auto w-full max-w-md lg:order-2">
        <Link href="/" className="relative mx-auto mb-8 block h-8 w-[140px] lg:hidden">
          <Image src={LOGO} alt="Dentivital" fill sizes="140px" className="object-contain" />
        </Link>

        <p className="eyebrow text-dv-coral-600">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">{title}</h1>
        <p className="mt-2 text-sm text-dv-ink-soft">{subtitle}</p>

        <div className="mt-8">{children}</div>

        {footer && <div className="mt-6 text-center text-sm text-dv-ink-soft">{footer}</div>}
      </div>
    </section>
  );
}
