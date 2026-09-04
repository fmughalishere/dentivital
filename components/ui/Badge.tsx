import type { ReactNode } from "react";
import type { OrderStatus } from "@/types";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "coral";

const TONES: Record<Tone, string> = {
  neutral: "bg-dv-mint-100 text-dv-teal-900",
  success: "bg-dv-success-bg text-dv-success",
  warning: "bg-dv-warning-bg text-dv-warning",
  danger: "bg-dv-danger-bg text-dv-danger",
  info: "bg-dv-info-bg text-dv-info",
  coral: "bg-dv-coral-100 text-dv-coral-600",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<OrderStatus, Tone> = {
  pending: "warning",
  paid: "info",
  processing: "info",
  shipped: "coral",
  delivered: "success",
  cancelled: "danger",
  refunded: "neutral",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={STATUS_TONE[status] ?? "neutral"}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </Badge>
  );
}

export default Badge;
