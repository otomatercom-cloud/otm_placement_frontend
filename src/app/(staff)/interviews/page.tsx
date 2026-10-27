import Topbar from "@/components/Topbar";
import { getInterviews } from "@/lib/queries";
import clsx from "clsx";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-teal/10 text-teal",
  confirmed: "bg-brand/10 text-brand-dark",
  completed: "bg-line text-ink",
  cancelled: "bg-rose/10 text-rose",
  no_show: "bg-amber/10 text-amber",
  rescheduled: "bg-amber/10 text-amber",
};

export default async function InterviewsPage({
  searchParams,
}: PageProps<"/interviews">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const interviews = await getInterviews({ status });

  return (
    <>
      <Topbar title="Mock Interviews" subtitle="Scheduled, completed and cancelled interviews" />
      <main className="flex-1 space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", value: undefined },
            { label: "Scheduled", value: "scheduled" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ].map((f) => (
            <Link
              key={f.label}
              href={f.value ? `/interviews?status=${f.value}` : "/interviews"}
              className={clsx(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                status === f.value
                  ? "border-brand bg-brand/10 text-brand-dark"
                  : "border-line bg-card text-slate hover:text-ink"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-paper text-left text-xs text-slate">
              <tr>
                <th className="px-4 py-3 font-medium">Candidate</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Interviewer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((iv) => (
                <tr key={iv.id} className="border-b border-line last:border-0 hover:bg-paper">
                  <td className="px-4 py-3 text-ink">{iv.candidate_id?.[1] || "—"}</td>
                  <td className="px-4 py-3 text-slate">
                    {new Date(iv.scheduled_start.replace(" ", "T")).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate">{iv.mode}</td>
                  <td className="px-4 py-3 text-slate">{iv.interviewer_display_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={clsx("rounded-full px-2.5 py-1 text-xs capitalize", STATUS_STYLES[iv.status])}>
                      {iv.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate">{iv.result ? iv.result.replace("_", " ") : "—"}</td>
                </tr>
              ))}
              {interviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate">
                    No interviews match this filter.
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
