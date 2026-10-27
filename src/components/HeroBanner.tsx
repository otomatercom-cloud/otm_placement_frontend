"use client";

import { useEffect, useState } from "react";

interface NextInterview {
  name: string;
  scheduledStart: string; // ISO-ish "YYYY-MM-DD HH:MM:SS"
}

interface TimePeriod {
  label: string;
  gradient: string;
}

const PERIODS: Record<"morning" | "afternoon" | "evening" | "night", TimePeriod> = {
  morning: {
    label: "Good morning",
    gradient:
      "radial-gradient(circle at 15% 20%, rgba(8,124,240,0.55), transparent 55%), radial-gradient(circle at 85% 80%, rgba(151,68,237,0.4), transparent 55%), #07122f",
  },
  afternoon: {
    label: "Good afternoon",
    gradient:
      "radial-gradient(circle at 15% 20%, rgba(8,124,240,0.5), transparent 55%), radial-gradient(circle at 85% 80%, rgba(8,200,90,0.35), transparent 55%), #07122f",
  },
  evening: {
    label: "Good evening",
    gradient:
      "radial-gradient(circle at 15% 20%, rgba(255,118,0,0.4), transparent 55%), radial-gradient(circle at 85% 80%, rgba(8,124,240,0.45), transparent 55%), #07122f",
  },
  night: {
    label: "Working late",
    gradient:
      "radial-gradient(circle at 15% 20%, rgba(8,124,240,0.35), transparent 55%), radial-gradient(circle at 85% 80%, rgba(102,115,140,0.4), transparent 55%), #07122f",
  },
};

function getPeriod(hour: number): keyof typeof PERIODS {
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function HeroBanner({
  teamLabel,
  interviewsToday,
  pendingReattempts,
  nextInterview,
}: {
  teamLabel: string;
  interviewsToday: number;
  pendingReattempts: number;
  nextInterview?: NextInterview | null;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only mount tick, see LiveClock
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const period = PERIODS[getPeriod(now ? now.getHours() : 9)];

  const nextStartMs = nextInterview
    ? new Date(nextInterview.scheduledStart.replace(" ", "T")).getTime()
    : null;
  const countdownMs = nextStartMs && now ? nextStartMs - now.getTime() : null;
  const hasUpcoming = countdownMs !== null && countdownMs > 0;

  return (
    <section
      className="hero-aurora reveal relative overflow-hidden rounded-2xl px-8 py-7 text-white shadow-card-hover"
      style={{ background: period.gradient }}
    >
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-2xl font-semibold">
            {period.label}, {teamLabel}
          </p>
          <p className="mt-1 max-w-xl text-sm text-sidebar-text">
            {interviewsToday} mock interview{interviewsToday === 1 ? "" : "s"} today ·{" "}
            {pendingReattempts} re-attempt request{pendingReattempts === 1 ? "" : "s"} waiting on your review.
          </p>
          {now && (
            <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight" suppressHydrationWarning>
              {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              <span className="ml-2 text-sm font-normal text-sidebar-text">
                {now.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" })}
              </span>
            </p>
          )}
        </div>

        {hasUpcoming && nextInterview && (
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-sidebar-text">Next interview</p>
            <p className="mt-1 text-sm text-white">{nextInterview.name}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-white" suppressHydrationWarning>
              {formatCountdown(countdownMs!)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
