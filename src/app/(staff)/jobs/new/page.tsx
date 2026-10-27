import Topbar from "@/components/Topbar";
import JobForm from "@/components/jobs/JobForm";
import { getPrograms } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const programs = await getPrograms();
  return (
    <>
      <Topbar title="New job opening" subtitle="Publish it to make it visible to approved candidates" />
      <main className="mx-auto w-full max-w-3xl flex-1 p-6">
        <JobForm programs={programs} />
      </main>
    </>
  );
}
