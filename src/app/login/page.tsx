"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, UserCog, UserRound, ArrowRight, ShieldCheck } from "lucide-react";
import clsx from "clsx";

function StaffForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Could not sign in.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded-lg bg-danger-bg px-4 py-2 text-sm text-rose">{error}</p>}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Username or email</span>
        <input
          required
          autoFocus
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink placeholder:text-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Password</span>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink placeholder:text-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </label>
      <button
        disabled={loading}
        className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <p className="text-center text-xs text-slate">Use your existing Odoo username and password.</p>
    </form>
  );
}

function CandidateForm() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "We couldn't find a registration with those details.");
        return;
      }
      router.push(`/c/status/${data.token}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="rounded-lg bg-danger-bg px-4 py-2 text-sm text-rose">{error}</p>}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">WhatsApp number</span>
          <input
            required
            autoFocus
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink placeholder:text-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Email address</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink placeholder:text-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <button
          disabled={loading}
          className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {loading ? "Checking…" : "View my status"}
        </button>
        <p className="text-center text-xs text-slate">
          Already registered? Check your mock-interview status or booking with the same details you signed up with.
        </p>
      </form>

      <div className="flex items-center gap-3 text-xs text-slate">
        <span className="h-px flex-1 bg-line" />
        New here?
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <a
          href="/c/register"
          className="flex items-center justify-between rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink transition-colors hover:border-brand hover:text-brand-dark"
        >
          Register for placement
          <ArrowRight size={16} />
        </a>
        <a
          href="/c/book"
          className="flex items-center justify-between rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink transition-colors hover:border-brand hover:text-brand-dark"
        >
          Book a mock interview
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}

function LoginForm() {
  const [tab, setTab] = useState<"staff" | "candidate">("staff");
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand story, hidden below lg since the form is what matters on mobile */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-semibold leading-tight">Logic School</p>
            <p className="text-xs leading-tight text-sidebar-text">Placement Console</p>
          </div>
        </div>

        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight">
            Your candidate pipeline, organized in one place.
          </h1>
          <p className="mt-4 max-w-sm text-sidebar-text">
            Registrations, interview slots and mock-interview outcomes — tracked, scheduled, and always up to date.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-sidebar-text">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand" />
            Your data is private and only visible to the placement team.
          </div>
        </div>

        <p className="text-xs text-sidebar-muted">© {year} Logic School of Management. All rights reserved.</p>
      </aside>

      {/* Right panel — the actual sign-in form */}
      <div className="flex flex-1 items-center justify-center bg-paper px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-base font-semibold leading-tight text-ink">Logic School</p>
              <p className="text-xs text-slate">Placement Console</p>
            </div>
          </div>

          <div className="mb-6 flex rounded-lg border border-line bg-card p-1">
            <button
              onClick={() => setTab("staff")}
              className={clsx(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm transition-colors",
                tab === "staff" ? "bg-light-blue text-brand font-medium" : "text-slate"
              )}
            >
              <UserCog size={15} /> Staff
            </button>
            <button
              onClick={() => setTab("candidate")}
              className={clsx(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm transition-colors",
                tab === "candidate" ? "bg-light-blue text-brand font-medium" : "text-slate"
              )}
            >
              <UserRound size={15} /> Candidate
            </button>
          </div>

          <h2 className="text-2xl font-semibold text-ink">
            {tab === "staff" ? "Welcome back" : "Check your status"}
          </h2>
          <p className="mt-1 mb-6 text-sm text-slate">
            {tab === "staff"
              ? "Sign in to your placement console account."
              : "For students registered with the placement cell."}
          </p>

          {tab === "staff" ? <StaffForm /> : <CandidateForm />}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
