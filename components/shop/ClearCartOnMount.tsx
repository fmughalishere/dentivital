"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

/** Empties the cart once the shopper lands on the order confirmation page. */
export default function ClearCartOnMount() {
  const { clearCart, setShippingRate, hydrated } = useCart();

  useEffect(() => {
    if (!hydrated) return;
    clearCart();
    setShippingRate(null);
  }, [hydrated, clearCart, setShippingRate]);

  return null;
}
