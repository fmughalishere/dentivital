import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-dv-line-strong bg-white/60 px-6 py-14 text-center ${className}`}
    >
      {icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-dv-mint-100 text-dv-teal-700">
          {icon}
        </span>
      )}
      <p className="font-display text-lg text-dv-teal-900">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-dv-ink-soft">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
