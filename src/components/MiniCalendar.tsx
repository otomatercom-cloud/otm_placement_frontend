import Link from "next/link";

export default function MiniCalendar({
  year,
  month, // 1-12
  slotCounts,
}: {
  year: number;
  month: number;
  slotCounts: Record<string, number>;
}) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const startOffset = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = firstOfMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl border border-line bg-card shadow-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base text-ink">{monthLabel}</h3>
        <span className="text-xs text-slate">Slot availability</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const count = slotCounts[dateStr] || 0;
          const isToday = dateStr === todayStr;
          return (
            <Link
              key={i}
              href={`/slots?date=${dateStr}`}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors ${
                isToday
                  ? "bg-brand-dark text-paper"
                  : count > 0
                    ? "bg-brand/10 text-brand-dark hover:bg-brand/20"
                    : "text-ink hover:bg-paper"
              }`}
            >
              <span>{day}</span>
              {count > 0 && !isToday && <span className="h-1 w-1 rounded-full bg-brand" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
