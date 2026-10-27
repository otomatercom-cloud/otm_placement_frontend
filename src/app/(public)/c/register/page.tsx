"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Meta {
  programs: { id: number; name: string }[];
  support_areas: { id: number; name: string }[];
  admission_years: string[];
}

export default function RegisterPage() {
  const router = useRouter();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    program_id: "",
    admission_year: "",
    qualification_status: "",
    employment_status: "jobseeker",
    company_name: "",
    designation: "",
    additional_support: "",
    interview_preference: "",
  });
  const [supportAreaIds, setSupportAreaIds] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/public/meta")
      .then((r) => r.json())
      .then(setMeta)
      .catch(() => setError("Could not load the registration form. Please refresh."));
  }, []);

  function toggleSupportArea(id: number) {
    setSupportAreaIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          program_id: Number(form.program_id) || undefined,
          support_area_ids: supportAreaIds,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Please check the form and try again.");
        return;
      }
      router.push(`/c/status/${data.token}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Register for placement support</h1>
      <p className="mt-1 text-sm text-slate">
        Tell us a bit about yourself so the placement cell can get you ready for interviews.
      </p>

      {error && <p className="mt-4 rounded-lg bg-danger-bg px-4 py-2 text-sm text-rose">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-ink">Personal Information</h2>
          <Field label="Full name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="WhatsApp number">
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Email address">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        {/* Academic Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-ink">Academic Information</h2>
          <Field label="Program">
            <select
              required
              value={form.program_id}
              onChange={(e) => setForm({ ...form, program_id: e.target.value })}
              className="input"
            >
              <option value="">Select your program</option>
              {meta?.programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Admission year">
            <select
              value={form.admission_year}
              onChange={(e) => setForm({ ...form, admission_year: e.target.value })}
              className="input"
            >
              <option value="">Select year</option>
              {meta?.admission_years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Current status">
            <select
              value={form.qualification_status}
              onChange={(e) => setForm({ ...form, qualification_status: e.target.value })}
              className="input"
            >
              <option value="">Select status</option>
              <option value="partly_qualified">Partly Qualified</option>
              <option value="fully_qualified">Fully Qualified</option>
              <option value="not_qualified">Not Qualified</option>
            </select>
          </Field>
        </div>

        {/* Employment Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-ink">Employment Information</h2>
          <Field label="Employment status">
            <select
              value={form.employment_status}
              onChange={(e) => setForm({ ...form, employment_status: e.target.value })}
              className="input"
            >
              <option value="jobseeker">Jobseeker</option>
              <option value="employed">Employed</option>
              <option value="intern">Intern</option>
            </select>
          </Field>
          {form.employment_status === "employed" && (
            <>
              <Field label="Company name">
                <input
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Designation">
                <input
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="input"
                />
              </Field>
            </>
          )}
        </div>

        {/* Where would you like support? */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-ink">Where would you like support?</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {meta?.support_areas.map((area) => (
              <label
                key={area.id}
                className="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink has-[:checked]:border-brand has-[:checked]:bg-light-blue"
              >
                <input
                  type="checkbox"
                  checked={supportAreaIds.includes(area.id)}
                  onChange={() => toggleSupportArea(area.id)}
                  className="h-4 w-4 accent-brand"
                />
                {area.name}
              </label>
            ))}
          </div>
          <Field label="Additional requirements">
            <textarea
              rows={3}
              value={form.additional_support}
              onChange={(e) => setForm({ ...form, additional_support: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        {/* Interview preference */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-ink">Would you like a mock interview?</h2>
          <Field label="Preferred mock interview mode">
            <select
              value={form.interview_preference}
              onChange={(e) => setForm({ ...form, interview_preference: e.target.value })}
              className="input"
            >
              <option value="">Not right now</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </Field>
        </div>

        <button
          type="submit"
          disabled={submitting || !meta}
          className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Register"}
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-line);
          background: var(--color-card);
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          color: var(--color-ink);
        }
        .input:focus {
          outline: none;
          border-color: var(--color-brand);
          box-shadow: 0 0 0 2px rgb(8 124 240 / 0.2);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate">{label}</span>
      {children}
    </label>
  );
}
