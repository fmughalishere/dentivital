import { Check, Circle } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { OrderEvent, OrderStatus } from "@/types";

const FLOW: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered"];

const LABEL: Record<OrderStatus, string> = {
  pending: "Order placed",
  paid: "Payment confirmed",
  processing: "Packing your order",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function OrderTimeline({
  status,
  timeline,
}: {
  status: OrderStatus;
  timeline: OrderEvent[];
}) {
  const closed = status === "cancelled" || status === "refunded";
  const steps = closed ? [...FLOW.slice(0, 2), status] : FLOW;
  const currentIndex = steps.indexOf(status);

  function timeFor(step: OrderStatus) {
    const event = [...timeline].reverse().find((e) => e.status === step);
    return event ? formatDateTime(event.at) : null;
  }

  return (
    <ol className="relative space-y-6 border-l border-dv-line pl-6">
      {steps.map((step, i) => {
        const done = currentIndex >= 0 && i <= currentIndex;
        const isCurrent = i === currentIndex;
        const at = timeFor(step);
        const danger = step === "cancelled" || step === "refunded";

        return (
          <li key={step} className="relative">
            <span
              className={`absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                done
                  ? danger
                    ? "border-dv-danger bg-dv-danger text-white"
                    : "border-dv-teal-500 bg-dv-teal-500 text-white"
                  : "border-dv-line bg-white text-dv-line"
              }`}
            >
              {done ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2 fill-current" />}
            </span>
            <p
              className={`text-sm ${
                isCurrent ? "font-medium text-dv-teal-900" : done ? "text-dv-ink" : "text-dv-ink-soft"
              }`}
            >
              {LABEL[step]}
            </p>
            <p className="mt-0.5 text-xs text-dv-ink-soft">{at ?? "Pending"}</p>
          </li>
        );
      })}
    </ol>
  );
}
