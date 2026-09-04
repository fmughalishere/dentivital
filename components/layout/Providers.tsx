"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { UIProvider } from "@/context/UIContext";
import type { AppUser, SessionUser } from "@/types";

export default function Providers({
  initialUser,
  children,
}: {
  initialUser: SessionUser | null;
  children: ReactNode;
}) {
  return (
    <UIProvider>
      <AuthProvider initialUser={initialUser as AppUser | null}>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </UIProvider>
  );
}
