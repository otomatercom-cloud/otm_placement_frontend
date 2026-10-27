export default function BreakdownBars({
  title,
  data,
  accent = "#087cf0",
}: {
  title: string;
  data: { label: string; count: number }[];
  accent?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-2xl border border-line bg-card shadow-card p-5">
      <h3 className="mb-4 font-display text-base text-ink">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-slate">No data yet.</p>
      ) : (
        <div className="space-y-3">
          {data.map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate">
                <span className="capitalize">{row.label}</span>
                <span>{row.count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-paper">
                <div
                  className="h-full origin-left animate-[growBar_0.8s_ease-out] rounded-full"
                  style={{ width: `${(row.count / max) * 100}%`, background: accent }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
