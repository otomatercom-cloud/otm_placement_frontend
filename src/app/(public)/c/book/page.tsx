"use client";

import { useState } from "react";

interface Session {
  candidate_id: number;
  token: string;
  name: string;
  program: string;
  status: string;
  status_label: string;
}

interface PublicSlot {
  id: number;
  date: string;
  date_label: string;
  time_label: string;
  mode: string;
  available: boolean;
  venue: string | false;
  interviewer: string;
}

export default function BookPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [lookup, setLookup] = useState({ phone: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [slots, setSlots] = useState<PublicSlot[]>([]);
  const [confirmation, setConfirmation] = useState<Record<string, unknown> | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lookup),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "We couldn't find your registration.");
        return;
      }
      setSession(data);
      if (data.status === "scheduled") return;
      await loadSlots(mode);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSlots(m: "online" | "offline") {
    setMode(m);
    const res = await fetch(`/api/public/slots?mode=${m}`);
    const data = await res.json();
    setSlots(data.slots || []);
  }

  async function handleBook(slotId: number) {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: session.candidate_id,
          slot_id: slotId,
          token: session.token,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "This slot is no longer available.");
        await loadSlots(mode);
        return;
      }
      setConfirmation(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (confirmation) {
    return (
      <div className="rounded-2xl border border-line bg-card shadow-card p-6">
        <h1 className="font-display text-xl text-ink">You&apos;re booked!</h1>
        <p className="mt-2 text-sm text-slate">
          {confirmation.date_label as string} at {confirmation.time_label as string} ·{" "}
          {confirmation.mode as string}
        </p>
        {!!confirmation.venue && <p className="text-sm text-slate">Venue: {confirmation.venue as string}</p>}
        {!!confirmation.interviewer && (
          <p className="text-sm text-slate">Interviewer: {confirmation.interviewer as string}</p>
        )}
        <p className="mt-4 text-xs text-slate">
          Save this link to check your status later: <br />
          <code>/c/status/{session?.token}</code>
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <h1 className="font-display text-2xl text-ink">Book your mock interview</h1>
        <p className="mt-1 text-sm text-slate">
          Already registered? Confirm your details to see available slots.
        </p>
        {error && <p className="mt-4 rounded-lg bg-rose/10 px-4 py-2 text-sm text-rose">{error}</p>}
        <form onSubmit={handleLookup} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate">WhatsApp number</span>
            <input
              required
              value={lookup.phone}
              onChange={(e) => setLookup({ ...lookup, phone: e.target.value })}
              className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate">Email address</span>
            <input
              required
              type="email"
              value={lookup.email}
              onChange={(e) => setLookup({ ...lookup, email: e.target.value })}
              className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </label>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
    );
  }

  if (session.status === "scheduled") {
    return (
      <div className="rounded-2xl border border-line bg-card shadow-card p-6">
        <h1 className="font-display text-xl text-ink">Hi {session.name}</h1>
        <p className="mt-2 text-sm text-slate">
          You already have a mock interview scheduled. Check your status page for details.
        </p>
        <a href={`/c/status/${session.token}`} className="mt-4 inline-block text-sm text-brand-dark hover:underline">
          View my status →
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Hi {session.name}, pick a slot</h1>
      <p className="mt-1 text-sm text-slate">{session.program}</p>

      {error && <p className="mt-4 rounded-lg bg-rose/10 px-4 py-2 text-sm text-rose">{error}</p>}

      <div className="mt-4 flex gap-2">
        {(["online", "offline"] as const).map((m) => (
          <button
            key={m}
            onClick={() => loadSlots(m)}
            className={`rounded-full border px-3.5 py-1.5 text-sm capitalize ${
              mode === m ? "border-brand bg-brand/10 text-brand-dark" : "border-line text-slate"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {slots.length === 0 && <p className="text-sm text-slate">No {mode} slots available right now.</p>}
        {slots.map((s) => (
          <button
            key={s.id}
            disabled={!s.available || loading}
            onClick={() => handleBook(s.id)}
            className="flex w-full items-center justify-between rounded-lg border border-line bg-card px-4 py-3 text-left text-sm disabled:opacity-40"
          >
            <div>
              <p className="text-ink">
                {s.date_label} · {s.time_label}
              </p>
              <p className="text-xs text-slate">{s.interviewer || "Interviewer TBD"}{s.venue ? ` · ${s.venue}` : ""}</p>
            </div>
            <span className="text-xs text-brand-dark">{s.available ? "Book" : "Full"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
