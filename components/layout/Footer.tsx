import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import NewsletterForm from "@/components/forms/NewsletterForm";
import { LOGO } from "@/lib/assets";

const EXPLORE = [
  { href: "/products/60-pcs-teeth-whitening-strips", label: "60 PCs Whitening Strips" },
  { href: "/products/42-pcs-teeth-whitening-strips", label: "42 PCs Whitening Strips" },
  { href: "/products/28-pcs-teeth-whitening-strips", label: "28 PCs Whitening Strips" },
  { href: "/products/dentivital-brush", label: "Dentivital Brush" },
];

const COMPANY = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Our Products" },
  { href: "/about", label: "Who We Are" },
  { href: "/blogs", label: "Dentivital Blogs" },
  { href: "/contact", label: "Contact Us" },
];

/**
 * TikTok, drawn here because lucide-react does not have it.
 *
 * Lucide ships only a handful of brand marks — Facebook and Instagram are two
 * of them, TikTok is not — so this is the official glyph as a filled path on
 * the same 24-unit grid, taking `currentColor` like the rest.
 *
 * Filled rather than stroked, which is a deliberate break from the outline
 * icons beside it. These buttons render the icon at 16px, and TikTok's mark
 * outlined at that size collapses into an unreadable squiggle. A brand mark
 * that is not recognised is not doing its job, and recognition beats stroke
 * consistency for a logo.
 */
function TikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .77-5.06V9.7a5.71 5.71 0 1 0 4.91 5.66V9.01a7.35 7.35 0 0 0 4.29 1.37V7.29a4.28 4.28 0 0 1-3.23-1.47Z" />
    </svg>
  );
}

/**
 * The clinic's real profiles.
 *
 * These were placeholders — "https://facebook.com", "https://instagram.com",
 * "https://linkedin.com" — which is worse than having no icons at all: a
 * visitor who clicks "Instagram" expecting Dentivital lands on Instagram's own
 * login page and concludes the brand has no presence there.
 *
 * LinkedIn is gone rather than repointed, because there is no Dentivital
 * LinkedIn page to point it at. An icon for an account that does not exist is
 * the same broken promise in a different colour; add it back here the day the
 * page does.
 */
const SOCIALS = [
  {
    href: "https://www.instagram.com/dentivitalinc/",
    label: "Instagram",
    Icon: Instagram,
  },
  {
    href: "https://www.tiktok.com/@dentivitalinc",
    label: "TikTok",
    Icon: TikTok,
  },
  {
    href: "https://www.facebook.com/profile.php?id=61594192825621",
    label: "Facebook",
    Icon: Facebook,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-dv-line bg-white">
      <div className="dv-container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="relative h-8 w-[140px]">
            <Image
              src={LOGO}
              alt="Dentivital"
              fill
              sizes="140px"
              className="object-contain object-left"
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-dv-ink-soft">
            Dentivital goes beyond surface-level whitening, addressing underlying oral health with
            clinically-proven products made from natural ingredients.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-dv-line text-dv-teal-700 transition-colors hover:border-dv-teal-500 hover:bg-dv-mint-100"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow text-dv-teal-700">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-dv-ink-soft transition-colors hover:text-dv-coral-600">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-dv-teal-700">Company</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {COMPANY.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-dv-ink-soft transition-colors hover:text-dv-coral-600">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-dv-teal-700">Stay in touch</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href="tel:+923100404444"
                className="flex items-center gap-2 text-dv-ink-soft transition-colors hover:text-dv-coral-600"
              >
                <Phone className="h-3.5 w-3.5" /> +92 310 0404444
              </a>
            </li>
            <li>
              <a
                href="mailto:info@dentivital.com"
                className="flex items-center gap-2 text-dv-ink-soft transition-colors hover:text-dv-coral-600"
              >
                <Mail className="h-3.5 w-3.5" /> info@dentivital.com
              </a>
            </li>
          </ul>
          <p className="mt-5 text-xs text-dv-ink-soft">Get the latest deals and offers by email.</p>
          <div className="mt-3">
            <NewsletterForm compact />
          </div>
        </div>
      </div>

      <div className="border-t border-dv-line">
        <div className="dv-container flex flex-col items-center justify-between gap-2 py-5 text-xs text-dv-ink-soft sm:flex-row">
          <p>© {new Date().getFullYear()} Dentivital. All rights reserved.</p>
          <p>Secure payments by Stripe · Free shipping over $50</p>
        </div>
      </div>
    </footer>
  );
}
