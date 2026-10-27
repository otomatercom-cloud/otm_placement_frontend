import { notFound } from "next/navigation";
import { odooBffCall } from "@/lib/odoo";
import JobBoard, { type PortalJob } from "@/components/jobs/JobBoard";

export const dynamic = "force-dynamic";

interface JobsResponse {
  candidate: { id: number; name: string; program: string };
  approved: boolean;
  jobs: PortalJob[];
}

export default async function JobsPage({ params }: PageProps<"/c/jobs/[token]">) {
  const { token } = await params;

  let data: JobsResponse;
  try {
    data = await odooBffCall<JobsResponse>("/api/placement/jobs", { query: { token } });
  } catch {
    notFound();
  }

  return <JobBoard token={token} candidate={data.candidate} approved={data.approved} jobs={data.jobs} />;
}
