"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

/* ============================================================== toasts ==== */

export type ToastTone = "success" | "error" | "info" | "warning";

type Toast = {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
};

/* ========================================================== confirm ====== */

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
};

type ConfirmState = ConfirmOptions & { resolve: (value: boolean) => void };

/* ============================================================ context ==== */

type UIContextValue = {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
  };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const UIContext = createContext<UIContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { icon: ReactNode; ring: string; bar: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-dv-success" />,
    ring: "border-dv-success/25",
    bar: "bg-dv-success",
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-dv-danger" />,
    ring: "border-dv-danger/25",
    bar: "bg-dv-danger",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-dv-warning" />,
    ring: "border-dv-warning/25",
    bar: "bg-dv-warning",
  },
  info: {
    icon: <Info className="h-5 w-5 text-dv-info" />,
    ring: "border-dv-info/25",
    bar: "bg-dv-info",
  },
};

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-3), { id, tone, title, description }]);
      window.setTimeout(() => dismiss(id), tone === "error" ? 6500 : 4200);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (title: string, description?: string) => push("success", title, description),
      error: (title: string, description?: string) => push("error", title, description),
      info: (title: string, description?: string) => push("info", title, description),
      warning: (title: string, description?: string) => push("warning", title, description),
    }),
    [push]
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...options, resolve });
    });
  }, []);

  const settle = useCallback(
    (value: boolean) => {
      confirmState?.resolve(value);
      setConfirmState(null);
    },
    [confirmState]
  );

  // Escape closes the confirm dialog; body scroll is locked while it's open.
  useEffect(() => {
    if (!confirmState) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [confirmState, settle]);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <UIContext.Provider value={value}>
      {children}

      {/* Toast stack */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-auto sm:items-end sm:p-6"
      >
        {toasts.map((t) => {
          const style = TONE_STYLES[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto relative flex w-full max-w-sm animate-dv-scale-in items-start gap-3 overflow-hidden rounded-2xl border bg-white p-4 pl-5 shadow-lift ${style.ring}`}
            >
              <span className={`absolute left-0 top-0 h-full w-1 ${style.bar}`} aria-hidden />
              <span className="mt-0.5 shrink-0">{style.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-dv-teal-900">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-dv-ink-soft">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-lg p-1 text-dv-ink-soft transition-colors hover:bg-dv-mint-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 animate-dv-fade-in bg-dv-teal-900/40 backdrop-blur-[2px]"
            onClick={() => settle(false)}
            aria-hidden
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dv-confirm-title"
            className="relative w-full max-w-md animate-dv-scale-in rounded-3xl bg-white p-6 shadow-lift"
          >
            <div className="flex items-start gap-4">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  confirmState.tone === "danger" ? "bg-dv-danger-bg" : "bg-dv-mint-100"
                }`}
              >
                {confirmState.tone === "danger" ? (
                  <AlertTriangle className="h-5 w-5 text-dv-danger" />
                ) : (
                  <Info className="h-5 w-5 text-dv-teal-700" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  id="dv-confirm-title"
                  className="font-display text-lg leading-snug text-dv-teal-900"
                >
                  {confirmState.title}
                </h2>
                {confirmState.description && (
                  <p className="mt-2 text-sm leading-relaxed text-dv-ink-soft">
                    {confirmState.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => settle(false)}
                className="rounded-full border border-dv-line-strong px-5 py-2.5 text-sm font-medium text-dv-ink transition-colors hover:bg-dv-mint-100"
              >
                {confirmState.cancelLabel ?? "Cancel"}
              </button>
              <button
                autoFocus
                onClick={() => settle(true)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors ${
                  confirmState.tone === "danger"
                    ? "bg-dv-danger hover:bg-dv-danger/90"
                    : "bg-dv-teal-900 hover:bg-dv-teal-700"
                }`}
              >
                {confirmState.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}
