import Topbar from "@/components/Topbar";
import { getCandidates } from "@/lib/queries";
import { STAGE_LABELS, type CandidateStage } from "@/lib/types";
import Link from "next/link";
import clsx from "clsx";

export const dynamic = "force-dynamic";

const FILTERS: { label: string; value?: CandidateStage }[] = [
  { label: "All" },
  { label: "New", value: "new" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Contacted", value: "contacted" },
  { label: "Interview Scheduled", value: "interview_scheduled" },
  { label: "Placement", value: "placement" },
];

export default async function CandidatesPage({
  searchParams,
}: PageProps<"/candidates">) {
  const sp = await searchParams;
  const stage = typeof sp.stage === "string" ? sp.stage : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const { candidates, total } = await getCandidates({ stage, q, limit: 100 });

  return (
    <>
      <Topbar title="Candidates" subtitle={`${total} registered`} />
      <main className="flex-1 space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.label}
              href={f.value ? `/candidates?stage=${f.value}` : "/candidates"}
              className={clsx(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                stage === f.value
                  ? "border-brand bg-brand/10 text-brand-dark"
                  : "border-line bg-card text-slate hover:text-ink"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <form action="/candidates" method="get" className="flex gap-2">
          {stage && <input type="hidden" name="stage" value={stage} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name, email or phone…"
            className="w-full max-w-sm rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-slate focus:border-brand focus:outline-none"
          />
          <button className="rounded-lg bg-ink px-4 py-2 text-sm text-paper">Search</button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-paper text-left text-xs text-slate">
              <tr>
                <th className="px-4 py-3 font-medium">Candidate</th>
                <th className="px-4 py-3 font-medium">Program</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Interview</th>
                <th className="px-4 py-3 font-medium">Registered</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper">
                  <td className="px-4 py-3">
                    <Link href={`/candidates/${c.id}`} className="font-medium text-ink hover:text-brand-dark">
                      {c.name}
                    </Link>
                    <p className="text-xs text-slate">{c.candidate_reference}</p>
                  </td>
                  <td className="px-4 py-3 text-slate">{c.program_id ? c.program_id[1] : "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-paper px-2.5 py-1 text-xs text-ink">
                      {STAGE_LABELS[c.stage]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate">{c.interview_progress_status || "—"}</td>
                  <td className="px-4 py-3 text-slate">
                    {new Date(c.registration_date.replace(" ", "T")).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate">
                    No candidates match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
