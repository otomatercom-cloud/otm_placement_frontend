import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, ExternalLink, MapPin } from "lucide-react";
import { odooBffCall } from "@/lib/odoo";
import { Badge, Card, EmptyState } from "@/components/ui";
import ApplyButton from "@/components/jobs/ApplyButton";

export const dynamic = "force-dynamic";

interface Job {
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

interface JobsResponse {
  candidate: { id: number; name: string; program: string };
  approved: boolean;
  jobs: Job[];
}

export default async function JobsPage({ params }: PageProps<"/c/jobs/[token]">) {
  const { token } = await params;

  let data: JobsResponse;
  try {
    data = await odooBffCall<JobsResponse>("/api/placement/jobs", { query: { token } });
  } catch {
    notFound();
  }

  return (
    <div>
      <Link href={`/c/status/${token}`} className="text-sm text-brand-dark hover:underline">
        Back to my status
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-ink">Job openings</h1>
      <p className="mt-1 text-sm text-slate">Hi {data.candidate.name}, these roles are open to you.</p>

      {!data.approved ? (
        <Card className="mt-6">
          <EmptyState
            icon={Briefcase}
            title="Not approved for job openings yet"
            description="The placement cell will approve your profile soon. Check back after that."
          />
        </Card>
      ) : data.jobs.length === 0 ? (
        <Card className="mt-6">
          <EmptyState icon={Briefcase} title="No openings right now" description="New roles will show up here when they are published." />
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {data.jobs.map((j) => (
            <Card key={j.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-ink">{j.title}</h2>
                  <p className="text-sm text-slate">{j.company}</p>
                </div>
                <Badge tone="info">{j.employment_type}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate">
                {j.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {j.location}
                  </span>
                )}
                {j.salary_range && <span>{j.salary_range}</span>}
                <span>{j.openings} vacancies</span>
                {j.last_date && <span>Apply by {j.last_date}</span>}
              </div>
              {j.description && <p className="mt-3 whitespace-pre-line text-sm text-ink">{j.description}</p>}
              {j.requirements && (
                <div className="mt-3">
                  <p className="text-xs text-slate">Requirements</p>
                  <p className="whitespace-pre-line text-sm text-ink">{j.requirements}</p>
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ApplyButton candidateId={data.candidate.id} jobId={j.id} token={token} applied={j.applied} />
                {j.apply_link && (
                  <a
                    href={j.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-brand-dark hover:underline"
                  >
                    Company page <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
