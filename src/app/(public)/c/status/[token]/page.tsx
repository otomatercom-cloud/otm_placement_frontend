import { odooBffCall } from "@/lib/odoo";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface StatusResponse {
  candidate: { id: number; name: string; program: string; stage: string };
  status: string;
  status_label: string;
  interview: {
    mode: string;
    status: string;
    date_label: string;
    time_label: string;
    interviewer: string;
    venue: string;
    meeting_url: string;
  } | null;
  placed: boolean;
}

export default async function StatusPage({
  params,
}: PageProps<"/c/status/[token]">) {
  const { token } = await params;

  let data: StatusResponse;
  try {
    data = await odooBffCall<StatusResponse>("/api/placement/candidates/status", {
      query: { token },
    });
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Hi {data.candidate.name}</h1>
      <p className="mt-1 text-sm text-slate">{data.candidate.program}</p>

      <div className="mt-6 rounded-2xl border border-line bg-card shadow-card p-5">
        <p className="text-xs text-slate">Mock interview status</p>
        <p className="mt-1 font-display text-lg text-ink">{data.status_label}</p>

        {data.interview && (
          <div className="mt-4 space-y-1 text-sm text-slate">
            <p>
              {data.interview.date_label} · {data.interview.time_label} · {data.interview.mode}
            </p>
            {data.interview.interviewer && <p>Interviewer: {data.interview.interviewer}</p>}
            {data.interview.venue && <p>Venue: {data.interview.venue}</p>}
            {data.interview.meeting_url && (
              <a href={data.interview.meeting_url} className="text-brand-dark hover:underline">
                Join meeting link →
              </a>
            )}
          </div>
        )}

        {data.status === "not_booked" && (
          <a href="/c/book" className="mt-4 inline-block text-sm text-brand-dark hover:underline">
            Book a mock interview →
          </a>
        )}
      </div>

      {data.placed && (
        <div className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-5">
          <p className="font-display text-base text-brand-dark">Congratulations — you&apos;ve been placed! 🎓</p>
        </div>
      )}
    </div>
  );
}
