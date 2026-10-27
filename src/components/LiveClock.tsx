"use client";

import { useEffect, useState } from "react";

export default function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // First tick happens after mount only, so the server-rendered markup
    // (which has no clock) and the client's first paint agree; the
    // suppressHydrationWarning below covers the one swap from empty -> time.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: this is the client-only mount tick, not a reactive sync
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {now
        ? `${now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })} · ${now.toLocaleTimeString(
            "en-IN",
            { hour: "numeric", minute: "2-digit" }
          )}`
        : ""}
    </span>
  );
}
