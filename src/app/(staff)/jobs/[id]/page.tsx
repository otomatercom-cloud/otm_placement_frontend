import Link from "next/link";
import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import { Badge, Card, CardHeader, CardTitle } from "@/components/ui";
import JobActions from "@/components/jobs/JobActions";
import { getJobDetail } from "@/lib/queries";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

const TONE = { draft: "neutral", published: "success", closed: "warning" } as const;

export default async function JobDetailPage({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  const { job, applications, programs } = await getJobDetail(Number(id));
  if (!job) notFound();

  return (
    <>
      <Topbar title={job.name} subtitle={job.company_name} />
      <main className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge tone={TONE[job.state]} className="capitalize">
                {job.state}
              </Badge>
              <span className="text-sm text-slate">{EMPLOYMENT_TYPE_LABELS[job.employment_type]}</span>
            </div>
            <JobActions id={job.id} state={job.state} />
          </CardHeader>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <F label="Location" value={job.location || "—"} />
            <F label="Salary / stipend" value={job.salary_range || "—"} />
            <F label="Vacancies" value={String(job.openings)} />
            <F label="Last date" value={job.last_date || "—"} />
            <F label="Eligible programs" value={programs.length ? programs.map((p) => p.name).join(", ") : "All programs"} />
            <F label="Careers link" value={job.apply_link || "—"} />
          </dl>
          {job.description && <Text title="Description" text={job.description} />}
          {job.requirements && <Text title="Requirements" text={job.requirements} />}
        </Card>

        <Card padded={false}>
          <div className="p-4 sm:p-5">
            <CardTitle>Applications ({applications.length})</CardTitle>
          </div>
          {applications.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-slate">No applications yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-y border-line bg-paper text-left text-xs text-slate">
                <tr>
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/candidates/${a.candidate_id[0]}`} className="font-medium text-ink hover:text-brand-dark">
                        {a.candidate_id[1]}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate">
                      {new Date(a.applied_date.replace(" ", "T") + "Z").toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-slate">{a.note || "—"}</td>
                    <td className="px-4 py-3 capitalize text-slate">{a.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </main>
    </>
  );
}

function F({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate">{label}</dt>
      <dd className="mt-0.5 break-words text-ink">{value}</dd>
    </div>
  );
}

function Text({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-5">
      <p className="mb-1 text-xs text-slate">{title}</p>
      <p className="whitespace-pre-line text-sm text-ink">{text}</p>
    </div>
  );
}
