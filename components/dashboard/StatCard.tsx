import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "teal",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "teal" | "coral" | "success" | "warning";
}) {
  const tones = {
    teal: "bg-dv-mint-100 text-dv-teal-700",
    coral: "bg-dv-coral-100 text-dv-coral-600",
    success: "bg-dv-success-bg text-dv-success",
    warning: "bg-dv-warning-bg text-dv-warning",
  } as const;

  return (
    <div className="rounded-2xl border border-dv-line bg-white p-5">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-xs text-dv-ink-soft">{label}</p>
      <p className="mt-0.5 font-display text-2xl text-dv-teal-900">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-dv-ink-soft">{hint}</p>}
    </div>
  );
}
