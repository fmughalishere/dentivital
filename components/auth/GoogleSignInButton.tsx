"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useUI } from "@/context/UIContext";
import type { AppUser } from "@/types";

type GoogleCredentialResponse = { credential?: string };

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode?: "popup" | "redirect";
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: Record<string, string | number | boolean>
      ) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({
  onSuccess,
  label = "signin_with",
}: {
  onSuccess: (user: AppUser) => void;
  label?: "signin_with" | "signup_with" | "continue_with";
}) {
  const { toast } = useUI();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) return;
      setBusy(true);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Google sign-in failed.");
        onSuccess(data.user as AppUser);
      } catch (err) {
        toast.error("Google sign-in failed", err instanceof Error ? err.message : undefined);
      } finally {
        setBusy(false);
      }
    },
    [onSuccess, toast]
  );

  useEffect(() => {
    if (!ready || !CLIENT_ID || !containerRef.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredential,
      ux_mode: "popup",
    });
    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text: label,
      logo_alignment: "center",
      width: 320,
    });
  }, [ready, handleCredential, label]);

  if (!CLIENT_ID) {
    return (
      <p className="rounded-xl border border-dashed border-dv-line-strong px-4 py-3 text-center text-xs text-dv-ink-soft">
        Google sign-in is not configured yet. Add{" "}
        <code className="rounded bg-dv-mint-100 px-1">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to
        enable it.
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div className="flex justify-center" aria-busy={busy}>
        <div ref={containerRef} />
      </div>
    </>
  );
}
