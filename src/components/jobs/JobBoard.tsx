"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Briefcase, CalendarClock, ExternalLink, IndianRupee, MapPin, Search, Users, X } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import ApplyButton from "@/components/jobs/ApplyButton";
import { cn } from "@/lib/utils";

export interface PortalJob {
  id: number;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  salary_range: string;
  openings: number;
  description: string;
  requirements: string;
  last_date: string;
  apply_link: string;
  applied: boolean;
  application_state: string;
}

interface Props {
  token: string;
  candidate: { id: number; name: string; program: string };
  approved: boolean;
  jobs: PortalJob[];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function JobBoard({ token, candidate, approved, jobs }: Props) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const types = useMemo(() => Array.from(new Set(jobs.map((j) => j.employment_type))), [jobs]);
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        (!type || j.employment_type === type) &&
        (!t || [j.title, j.company, j.location].some((s) => s.toLowerCase().includes(t)))
    );
  }, [jobs, q, type]);

  const selected = filtered.find((j) => j.id === selectedId) ?? filtered[0] ?? null;

  return (
    <>
      {/* Search hero */}
      <section className="border-b border-line bg-navy">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-semibold text-white">Find your next role</h1>
              <p className="mt-1 text-sm text-white/70">
                {candidate.name} · {candidate.program}
              </p>
            </div>
            <Link
              href={`/c/status/${token}`}
              className="rounded-lg border border-white/25 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              My status
            </Link>
          </div>
          {approved && (
            <div className="mt-5 flex flex-col gap-2 rounded-xl bg-card p-2 shadow-card sm:flex-row">
              <label className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-4 w-4 text-slate" aria-hidden />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by job title, company or location"
                  className="h-11 w-full bg-transparent text-sm text-ink placeholder:text-slate focus:outline-none"
                />
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                aria-label="Job type"
                className="h-11 rounded-lg border border-line bg-card px-3 text-sm text-ink focus:border-brand focus:outline-none"
              >
                <option value="">All job types</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {!approved ? (
          <div className="rounded-2xl border border-line bg-card shadow-card">
            <EmptyState
              icon={Briefcase}
              title="Not approved for job openings yet"
              description="The placement cell will approve your profile soon. Check back after that."
            />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card shadow-card">
            <EmptyState icon={Briefcase} title="No openings right now" description="New roles will show up here when they are published." />
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate">
              {filtered.length} {filtered.length === 1 ? "job" : "jobs"} for you
            </p>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-line bg-card shadow-card">
                <EmptyState icon={Search} title="No jobs match your search" description="Try a different keyword or job type." />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_3fr]">
                {/* List */}
                <ul className="space-y-3">
                  {filtered.map((j) => (
                    <li key={j.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(j.id);
                          setSheetOpen(true);
                        }}
                        className={cn(
                          "w-full rounded-2xl border bg-card p-4 text-left shadow-card transition-colors hover:border-brand",
                          selected?.id === j.id ? "border-brand ring-1 ring-brand" : "border-line"
                        )}
                      >
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-light-blue text-sm font-semibold text-brand-dark">
                            {initials(j.company)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h2 className="truncate text-base font-semibold text-ink">{j.title}</h2>
                              {j.applied && <Badge tone="success">Applied</Badge>}
                            </div>
                            <p className="truncate text-sm text-slate">{j.company}</p>
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate">
                              {j.location && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {j.location}
                                </span>
                              )}
                              {j.salary_range && (
                                <span className="inline-flex items-center gap-1">
                                  <IndianRupee className="h-3.5 w-3.5" aria-hidden /> {j.salary_range}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge tone="info">{j.employment_type}</Badge>
                              {j.last_date && <span className="text-xs text-slate">Apply by {formatDate(j.last_date)}</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Detail: desktop pane */}
                <div className="hidden lg:block">
                  {selected && (
                    <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-line bg-card p-6 shadow-card">
                      <Detail job={selected} candidateId={candidate.id} token={token} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail: mobile sheet */}
      {sheetOpen && selected && (
        <div className="fixed inset-0 z-50 flex flex-col bg-card lg:hidden" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Job details</p>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-light-blue"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Detail job={selected} candidateId={candidate.id} token={token} />
          </div>
        </div>
      )}
    </>
  );
}

function Detail({ job, candidateId, token }: { job: PortalJob; candidateId: number; token: string }) {
  return (
    <div>
      <div className="flex gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-light-blue text-base font-semibold text-brand-dark">
          {initials(job.company)}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-ink">{job.title}</h2>
          <p className="text-sm text-slate">{job.company}</p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Info icon={<MapPin className="h-4 w-4" />} label="Location" value={job.location || "Not specified"} />
        <Info icon={<IndianRupee className="h-4 w-4" />} label="Salary / stipend" value={job.salary_range || "Not disclosed"} />
        <Info icon={<Briefcase className="h-4 w-4" />} label="Job type" value={job.employment_type} />
        <Info icon={<Users className="h-4 w-4" />} label="Vacancies" value={String(job.openings)} />
        {job.last_date && (
          <Info icon={<CalendarClock className="h-4 w-4" />} label="Apply by" value={formatDate(job.last_date)} />
        )}
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ApplyButton key={job.id} candidateId={candidateId} jobId={job.id} token={token} applied={job.applied} />
        {job.apply_link && (
          <a
            href={job.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-brand-dark hover:underline"
          >
            Company page <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        )}
      </div>

      {job.description && <Section title="Job description" text={job.description} />}
      {job.requirements && <Section title="Requirements" text={job.requirements} />}
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-paper p-3">
      <span className="mt-0.5 text-slate">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-slate">{label}</dt>
        <dd className="break-words text-ink">{value}</dd>
      </div>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-6 border-t border-line pt-5">
      <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{text}</p>
    </div>
  );
}
