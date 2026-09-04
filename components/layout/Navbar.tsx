"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { initials } from "@/lib/format";
import { LOGO } from "@/lib/assets";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "Who We Are" },
  { href: "/blogs", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

const ANNOUNCEMENTS = [
  "Free standard shipping on orders over $50",
  "Triple action · Zero sensitivity · Enamel restoration",
  "Loved by 100,000+ sensitive smiles",
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, openDrawer, hydrated } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const { toast, confirm } = useUI();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [announcement, setAnnouncement] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = window.setInterval(
      () => setAnnouncement((i) => (i + 1) % ANNOUNCEMENTS.length),
      4500
    );
    return () => window.clearInterval(id);
  }, []);

  // Close the menus on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    const ok = await confirm({
      title: "Sign out of Dentivital?",
      description: "Your cart stays saved on this device.",
      confirmLabel: "Sign out",
    });
    if (!ok) return;
    await signOut();
    toast.success("Signed out", "See you soon!");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Rotating announcement bar */}
      <div className="bg-dv-teal-900 text-dv-mint-50">
        <div className="dv-container flex h-9 items-center justify-center overflow-hidden">
          <p key={announcement} className="animate-dv-fade-in text-center text-[11px] tracking-wide">
            <Sparkles className="mr-1.5 inline h-3 w-3 text-dv-coral-500" aria-hidden />
            {ANNOUNCEMENTS[announcement]}
          </p>
        </div>
      </div>

      <div
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-dv-line bg-dv-mint-50/95 shadow-soft backdrop-blur-md"
            : "border-transparent bg-dv-mint-50/80 backdrop-blur"
        }`}
      >
        <div className="dv-container flex items-center justify-between gap-4 py-3.5">
          <Link href="/" className="relative block h-9 w-[148px] shrink-0" aria-label="Dentivital home">
            <Image
              src={LOGO}
              alt="Dentivital"
              fill
              sizes="148px"
              className="object-contain object-left"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : (pathname?.startsWith(link.href) ?? false);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-full px-3.5 py-2 text-sm transition-colors ${
                    active
                      ? "text-dv-coral-600"
                      : "text-dv-ink/75 hover:bg-dv-mint-100 hover:text-dv-teal-900"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-dv-coral-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            {/* Account */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full border border-dv-line-strong bg-white py-1 pl-1 pr-2.5 transition-colors hover:border-dv-teal-500"
                >
                  <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-dv-teal-900 text-[11px] font-medium text-white">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt=""
                        width={28}
                        height={28}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(user.name)
                    )}
                  </span>
                  <span className="hidden max-w-[90px] truncate text-xs text-dv-teal-900 sm:block">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-dv-ink-soft transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 animate-dv-scale-in overflow-hidden rounded-2xl border border-dv-line bg-white shadow-lift"
                  >
                    <div className="border-b border-dv-line px-4 py-3">
                      <p className="truncate text-sm font-medium text-dv-teal-900">{user.name}</p>
                      <p className="truncate text-xs text-dv-ink-soft">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      {isAdmin ? (
                        /* Staff see the admin panel only — no customer dashboard. */
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-dv-coral-600 transition-colors hover:bg-dv-coral-100"
                        >
                          <Sparkles className="h-4 w-4" /> Admin panel
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/account"
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-dv-ink transition-colors hover:bg-dv-mint-100"
                          >
                            <LayoutDashboard className="h-4 w-4 text-dv-teal-700" /> My dashboard
                          </Link>
                          <Link
                            href="/account/orders"
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-dv-ink transition-colors hover:bg-dv-mint-100"
                          >
                            <Package className="h-4 w-4 text-dv-teal-700" /> My orders
                          </Link>
                          <Link
                            href="/account/profile"
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-dv-ink transition-colors hover:bg-dv-mint-100"
                          >
                            <User className="h-4 w-4 text-dv-teal-700" /> Profile & settings
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-dv-ink transition-colors hover:bg-dv-mint-100"
                      >
                        <LogOut className="h-4 w-4 text-dv-teal-700" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-dv-ink/75 transition-colors hover:bg-dv-mint-100 hover:text-dv-teal-900 sm:flex"
              >
                <User className="h-4 w-4" /> Sign in
              </Link>
            )}

            {/* Cart — hidden for staff accounts, who can't place orders. */}
            {!isAdmin && (
              <button
                onClick={openDrawer}
                aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
                className="relative rounded-full p-2.5 text-dv-teal-900 transition-colors hover:bg-dv-mint-100"
              >
                <ShoppingBag className="h-5 w-5" />
                {hydrated && count > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-dv-coral-600 px-1 text-[10px] font-medium text-white">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            )}

            <button
              className="rounded-full p-2.5 text-dv-teal-900 transition-colors hover:bg-dv-mint-100 md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileOpen && (
          <nav
            className="animate-dv-fade-in border-t border-dv-line bg-dv-mint-50 md:hidden"
            aria-label="Mobile"
          >
            <div className="dv-container flex flex-col py-3">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-3 text-sm text-dv-ink transition-colors hover:bg-dv-mint-100"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-dv-line pt-2">
                {user ? (
                  <>
                    {isAdmin ? (
                      <Link
                        href="/admin"
                        className="block rounded-xl px-3 py-3 text-sm text-dv-coral-600"
                      >
                        Admin panel
                      </Link>
                    ) : (
                      <Link
                        href="/account"
                        className="block rounded-xl px-3 py-3 text-sm text-dv-ink transition-colors hover:bg-dv-mint-100"
                      >
                        My dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full rounded-xl px-3 py-3 text-left text-sm text-dv-ink transition-colors hover:bg-dv-mint-100"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-1 py-2">
                    <Link
                      href="/login"
                      className="flex-1 rounded-full border border-dv-line-strong py-2.5 text-center text-sm text-dv-teal-900"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="flex-1 rounded-full bg-dv-teal-900 py-2.5 text-center text-sm text-white"
                    >
                      Create account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
