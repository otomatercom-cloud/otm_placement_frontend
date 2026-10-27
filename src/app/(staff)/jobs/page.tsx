import Link from "next/link";
import { Plus } from "lucide-react";
import Topbar from "@/components/Topbar";
import { Badge, EmptyState, LinkButton } from "@/components/ui";
import JobActions from "@/components/jobs/JobActions";
import { getJobs } from "@/lib/queries";
import { EMPLOYMENT_TYPE_LABELS, type JobState } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS: { label: string; value?: JobState }[] = [
  { label: "All" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Closed", value: "closed" },
];
const TONE = { draft: "neutral", published: "success", closed: "warning" } as const;

export default async function JobsPage({ searchParams }: PageProps<"/jobs">) {
  const sp = await searchParams;
  const state = typeof sp.state === "string" ? sp.state : undefined;
  const jobs = await getJobs(state);

  return (
    <>
      <Topbar title="Job Openings" subtitle="Published jobs are visible only to approved candidates" />
      <main className="flex-1 space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.label}
                href={f.value ? `/jobs?state=${f.value}` : "/jobs"}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  state === f.value
                    ? "border-brand bg-brand/10 text-brand-dark"
                    : "border-line bg-card text-slate hover:text-ink"
                )}
              >
                {f.label}
              </Link>
            ))}
          </div>
          <LinkButton href="/jobs/new" size="sm" icon={<Plus className="h-4 w-4" />}>
            New job opening
          </LinkButton>
        </div>

        {jobs.length === 0 ? (
          <EmptyState title="No job openings" description="Create a job opening and publish it to approved candidates." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-card">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-paper text-left text-xs text-slate">
                <tr>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Last date</th>
                  <th className="px-4 py-3 font-medium">Applications</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-b border-line last:border-0 hover:bg-paper">
                    <td className="px-4 py-3">
                      <Link href={`/jobs/${j.id}`} className="font-medium text-ink hover:text-brand-dark">
                        {j.name}
                      </Link>
                      <p className="text-xs text-slate">{j.company_name}</p>
                    </td>
                    <td className="px-4 py-3 text-slate">{EMPLOYMENT_TYPE_LABELS[j.employment_type]}</td>
                    <td className="px-4 py-3 text-slate">{j.last_date || "—"}</td>
                    <td className="px-4 py-3 text-slate">{j.application_count}</td>
                    <td className="px-4 py-3">
                      <Badge tone={TONE[j.state]} className="capitalize">
                        {j.state}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <JobActions id={j.id} state={j.state} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
