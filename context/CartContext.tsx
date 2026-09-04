"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cartCount, cartSubtotal, computeTotals } from "@/lib/pricing";
import type { CartItem, Coupon, ShippingRate } from "@/types";

const STORAGE_KEY = "dentivital_cart_v2";

type PersistedCart = {
  items: CartItem[];
  coupon: Coupon | null;
  shippingRate: ShippingRate | null;
};

type CartContextValue = {
  items: CartItem[];
  coupon: Coupon | null;
  shippingRate: ShippingRate | null;
  drawerOpen: boolean;
  hydrated: boolean;
  count: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon | null) => void;
  setShippingRate: (rate: ShippingRate | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): PersistedCart {
  const empty: PersistedCart = { items: [], coupon: null, shippingRate: null };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PersistedCart>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      coupon: parsed.coupon ?? null,
      shippingRate: parsed.shippingRate ?? null,
    };
  } catch {
    return empty;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [shippingRate, setShippingRateState] = useState<ShippingRate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStorage();
    setItems(stored.items);
    setCoupon(stored.coupon);
    setShippingRateState(stored.shippingRate);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, coupon, shippingRate } satisfies PersistedCart)
      );
    } catch {
      // Storage can be unavailable (private mode / quota) — the cart still
      // works for this page view, it just won't survive a reload.
    }
  }, [items, coupon, shippingRate, hydrated]);

  // Lock page scroll while the cart drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      const max = item.stock ?? Infinity;
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, ...item, quantity: Math.min(max, i.quantity + qty) }
            : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(max, Math.max(1, qty)) }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, Math.min(i.stock ?? Infinity, qty)) }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const totals = useMemo(
    () => computeTotals({ items, coupon, rate: shippingRate }),
    [items, coupon, shippingRate]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      coupon,
      shippingRate,
      drawerOpen,
      hydrated,
      count: cartCount(items),
      subtotal: cartSubtotal(items),
      discount: totals.discount,
      shippingCost: totals.shippingCost,
      total: totals.total,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      applyCoupon: setCoupon,
      setShippingRate: setShippingRateState,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [items, coupon, shippingRate, drawerOpen, hydrated, totals, addItem, removeItem, updateQty, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
