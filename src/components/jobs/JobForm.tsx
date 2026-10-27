"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default function JobForm({ programs }: { programs: { id: number; name: string }[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [programIds, setProgramIds] = useState<number[]>([]);
  const [form, setForm] = useState({
    name: "",
    company_name: "",
    location: "",
    employment_type: "full_time",
    salary_range: "",
    openings: "1",
    last_date: "",
    apply_link: "",
    description: "",
    requirements: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(publish: boolean) {
    setSubmitting(publish ? "publish" : "draft");
    setError(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, program_ids: programIds, publish }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save the job opening.");
      router.push(`/jobs/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the job opening.");
      setSubmitting(null);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="space-y-5 rounded-2xl border border-line bg-card p-5 shadow-card"
    >
      {error && <p className="rounded-lg bg-danger-bg px-4 py-2 text-sm text-rose">{error}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <L label="Job title">
          <input required className={inputCls} value={form.name} onChange={set("name")} />
        </L>
        <L label="Company">
          <input required className={inputCls} value={form.company_name} onChange={set("company_name")} />
        </L>
        <L label="Location">
          <input className={inputCls} value={form.location} onChange={set("location")} />
        </L>
        <L label="Employment type">
          <select className={inputCls} value={form.employment_type} onChange={set("employment_type")}>
            {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </L>
        <L label="Salary / stipend">
          <input className={inputCls} placeholder="e.g. 3 - 4 LPA" value={form.salary_range} onChange={set("salary_range")} />
        </L>
        <L label="Vacancies">
          <input type="number" min={0} className={inputCls} value={form.openings} onChange={set("openings")} />
        </L>
        <L label="Last date to apply">
          <input type="date" className={inputCls} value={form.last_date} onChange={set("last_date")} />
        </L>
        <L label="Company careers link (optional)">
          <input type="url" className={inputCls} value={form.apply_link} onChange={set("apply_link")} />
        </L>
      </div>

      <div>
        <span className="mb-1.5 block text-sm text-slate">Eligible programs (leave empty for all)</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {programs.map((p) => (
            <label
              key={p.id}
              className="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink has-[:checked]:border-brand has-[:checked]:bg-light-blue"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand"
                checked={programIds.includes(p.id)}
                onChange={() =>
                  setProgramIds((prev) => (prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]))
                }
              />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      <L label="Job description">
        <textarea rows={4} className={inputCls} value={form.description} onChange={set("description")} />
      </L>
      <L label="Requirements">
        <textarea rows={4} className={inputCls} value={form.requirements} onChange={set("requirements")} />
      </L>

      <div className="flex flex-wrap gap-2">
        <Button type="button" loading={submitting === "publish"} disabled={!!submitting} onClick={() => submit(true)}>
          Save and publish
        </Button>
        <Button type="submit" variant="secondary" loading={submitting === "draft"} disabled={!!submitting}>
          Save as draft
        </Button>
      </div>
    </form>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate">{label}</span>
      {children}
    </label>
  );
}
