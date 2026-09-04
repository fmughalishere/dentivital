import { Star } from "lucide-react";

export default function Rating({
  value,
  count,
  size = "sm",
  className = "",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const dimension = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const rounded = Math.round(value);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="flex items-center gap-0.5 text-dv-coral-500" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={dimension} fill={i < rounded ? "currentColor" : "none"} />
        ))}
      </span>
      <span className="sr-only">{value.toFixed(1)} out of 5 stars</span>
      {count !== undefined && (
        <span className="ml-1 text-xs text-dv-ink-soft">({count})</span>
      )}
    </div>
  );
}
