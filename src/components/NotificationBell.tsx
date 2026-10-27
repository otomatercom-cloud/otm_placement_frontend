"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

interface Stats {
  interviews_today: number;
  pending_reattempts: number;
  slots_today: number;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const count = (stats?.pending_reattempts || 0) + (stats && stats.interviews_today > 0 ? 1 : 0);

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-light-blue text-slate"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-line bg-card p-3 shadow-lg">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">Notifications</p>
          {!stats ? (
            <p className="py-4 text-center text-sm text-slate">Loading…</p>
          ) : (
            <ul className="space-y-2">
              {stats.pending_reattempts > 0 && (
                <li>
                  <Link
                    href="/interviews"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-2 py-2 text-sm text-ink hover:bg-paper"
                  >
                    <span className="font-medium text-amber">{stats.pending_reattempts}</span> re-attempt
                    request{stats.pending_reattempts === 1 ? "" : "s"} waiting on your review
                  </Link>
                </li>
              )}
              {stats.interviews_today > 0 && (
                <li>
                  <Link
                    href="/interviews"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-2 py-2 text-sm text-ink hover:bg-paper"
                  >
                    <span className="font-medium text-teal">{stats.interviews_today}</span> mock interview
                    {stats.interviews_today === 1 ? "" : "s"} scheduled today
                  </Link>
                </li>
              )}
              {stats.slots_today > 0 && (
                <li>
                  <Link
                    href="/slots"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-2 py-2 text-sm text-ink hover:bg-paper"
                  >
                    <span className="font-medium text-brand-dark">{stats.slots_today}</span> interview slot
                    {stats.slots_today === 1 ? "" : "s"} available today
                  </Link>
                </li>
              )}
              {stats.pending_reattempts === 0 && stats.interviews_today === 0 && stats.slots_today === 0 && (
                <li className="py-4 text-center text-sm text-slate">Nothing new right now.</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
