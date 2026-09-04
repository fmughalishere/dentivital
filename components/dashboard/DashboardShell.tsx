"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package,
  Percent,
  Receipt,
  Settings,
  Store,
  Truck,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { initials } from "@/lib/format";
import { LOGO } from "@/lib/assets";
import type { SessionUser } from "@/types";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match nested routes too (e.g. /admin/orders/123). */
  prefix?: boolean;
};

/**
 * Nav definitions live *inside* this client component on purpose.
 *
 * lucide-react icons are React components (functions). React 19 / Next 16
 * cannot serialize a function across the server -> client boundary, so a
 * server layout must never pass icons down as props. Instead the server
 * layout passes a plain string `variant` and we look the nav up here.
 */
const ACCOUNT_NAV: NavItem[] = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "My orders", icon: Package, prefix: true },
  { href: "/account/profile", label: "Profile", icon: UserRound },
  { href: "/account/addresses", label: "Address book", icon: MapPin },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Receipt, prefix: true },
  { href: "/admin/products", label: "Products", icon: Package, prefix: true },
  { href: "/admin/coupons", label: "Discounts", icon: Percent },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/messages", label: "Inbox", icon: Mail },
];

const NAVS: Record<DashboardVariant, NavItem[]> = {
  account: ACCOUNT_NAV,
  admin: ADMIN_NAV,
};

export type DashboardVariant = "account" | "admin";

export default function DashboardShell({
  title,
  subtitle,
  variant,
  user,
  accent = "teal",
  children,
}: {
  title: string;
  subtitle: string;
  variant: DashboardVariant;
  user: SessionUser;
  accent?: "teal" | "coral";
  children: ReactNode;
}) {
  const items = NAVS[variant] ?? ACCOUNT_NAV;
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { confirm, toast } = useUI();
  const [open, setOpen] = useState(false);

  const accentClasses =
    accent === "coral"
      ? "bg-dv-coral-100 text-dv-coral-600"
      : "bg-dv-mint-100 text-dv-teal-900";

  async function handleSignOut() {
    const ok = await confirm({
      title: "Sign out?",
      description: "You'll need to sign in again to reach this dashboard.",
      confirmLabel: "Sign out",
    });
    if (!ok) return;
    await signOut();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  }

  const nav = (
    <nav className="space-y-1" aria-label={title}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.prefix
          ? (pathname?.startsWith(item.href) ?? false)
          : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? `${accentClasses} font-medium`
                : "text-dv-ink-soft hover:bg-dv-mint-100 hover:text-dv-teal-900"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarBody = (
    <>
      <div>
        <Link href="/" className="relative block h-7 w-[132px]">
          <Image
            src={LOGO}
            alt="Dentivital"
            fill
            sizes="132px"
            className="object-contain object-left"
          />
        </Link>
        <p className="mt-5 font-display text-lg text-dv-teal-900">{title}</p>
        <p className="text-xs text-dv-ink-soft">{subtitle}</p>

        <div className="mt-7">{nav}</div>
      </div>

      <div className="space-y-2 border-t border-dv-line pt-4">
        <div className="flex items-center gap-2.5 px-1 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dv-teal-900 text-[11px] font-medium text-white">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt=""
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              initials(user.name)
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium text-dv-teal-900">{user.name}</span>
            <span className="block truncate text-[11px] text-dv-ink-soft">{user.email}</span>
          </span>
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-dv-ink-soft transition-colors hover:bg-dv-mint-100 hover:text-dv-teal-900"
        >
          <Store className="h-4 w-4" /> Back to store
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-dv-ink-soft transition-colors hover:bg-dv-danger-bg hover:text-dv-danger"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-dv-mint-50 lg:flex">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-dv-line bg-white px-4 py-3 lg:hidden">
        <p className="font-display text-base text-dv-teal-900">{title}</p>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-xl p-2 text-dv-teal-900 transition-colors hover:bg-dv-mint-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-dv-line bg-white p-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
        {sidebarBody}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-dv-fade-in bg-dv-teal-900/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="relative ml-auto flex h-full w-72 max-w-[85vw] animate-dv-slide-in-right flex-col justify-between overflow-y-auto bg-white p-6 shadow-lift">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-4 top-4 rounded-xl p-2 text-dv-ink-soft hover:bg-dv-mint-100"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarBody}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
