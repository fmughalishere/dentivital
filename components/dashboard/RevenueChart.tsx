import { money } from "@/lib/format";

/**
 * Small dependency-free bar chart for the last 14 days of paid revenue.
 */
export default function RevenueChart({ data }: { data: { date: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="rounded-2xl border border-dv-line bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg text-dv-teal-900">Revenue · last 14 days</h2>
        <p className="font-display text-lg text-dv-teal-900">{money(total)}</p>
      </div>

      {total === 0 ? (
        <p className="mt-6 text-sm text-dv-ink-soft">
          No paid orders in this window yet — completed Stripe payments will appear here.
        </p>
      ) : (
        <div className="mt-6 flex h-40 items-end gap-1.5" role="img" aria-label="Daily revenue chart">
          {data.map((day) => {
            const height = Math.max(4, Math.round((day.total / max) * 100));
            return (
              <div key={day.date} className="group relative flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-dv-teal-500/85 transition-colors group-hover:bg-dv-coral-500"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[9px] text-dv-ink-soft">{day.date.slice(8)}</span>
                <span className="pointer-events-none absolute -top-8 z-10 hidden whitespace-nowrap rounded-lg bg-dv-teal-900 px-2 py-1 text-[10px] text-white group-hover:block">
                  {money(day.total)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
