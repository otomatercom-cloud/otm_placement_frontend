import Topbar from "@/components/Topbar";
import { getCandidateDetail } from "@/lib/queries";
import { STAGE_LABELS } from "@/lib/types";
import JobAccessCard from "@/components/JobAccessCard";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const QUALIFICATION_LABELS: Record<string, string> = {
  partly_qualified: "Partly Qualified",
  fully_qualified: "Fully Qualified",
  not_qualified: "Not Qualified",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  jobseeker: "Jobseeker",
  employed: "Employed",
  intern: "Intern",
};

const ERP_STATUS_LABELS: Record<string, string> = {
  not_checked: "Not Checked",
  unavailable: "Check Unavailable",
  not_found: "New — Not Found",
  lead_only: "Known Lead (Not Admitted)",
  current_student: "Existing Student",
  old_student: "Old Student (Alumni)",
};

export default async function CandidateDetailPage({
  params,
}: PageProps<"/candidates/[id]">) {
  const { id } = await params;
  const { candidate, mockInterviews, placements, supportAreas } = await getCandidateDetail(Number(id));

  if (!candidate) notFound();

  return (
    <>
      <Topbar title={candidate.name} subtitle={candidate.candidate_reference} />
      <main className="flex-1 space-y-6 p-6">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Contact & registration */}
          <div className="rounded-2xl border border-line bg-card shadow-card p-5 lg:col-span-2">
            <h3 className="mb-4 font-display text-base text-ink">Candidate details</h3>
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <Field label="Email" value={candidate.email} />
              <Field label="WhatsApp" value={candidate.phone} />
              <Field label="Program" value={candidate.program_id ? candidate.program_id[1] : "—"} />
              <Field label="Admission year" value={candidate.admission_year || "—"} />
              <Field label="Stage" value={STAGE_LABELS[candidate.stage]} />
              <Field
                label="Qualification status"
                value={
                  candidate.qualification_status
                    ? QUALIFICATION_LABELS[candidate.qualification_status]
                    : "—"
                }
              />
              <Field
                label="Employment status"
                value={candidate.employment_status ? EMPLOYMENT_LABELS[candidate.employment_status] : "—"}
              />
              {candidate.employment_status === "employed" && (
                <>
                  <Field label="Company" value={candidate.company_name || "—"} />
                  <Field label="Designation" value={candidate.designation || "—"} />
                </>
              )}
              <Field label="Interview mode" value={candidate.interview_preference || "—"} />
              <Field label="Interview progress" value={candidate.interview_progress_status || "—"} />
              <Field
                label="Registered"
                value={new Date(candidate.registration_date.replace(" ", "T")).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              />
              <Field
                label="Old ERP status"
                value={candidate.erp_check_status ? ERP_STATUS_LABELS[candidate.erp_check_status] : "—"}
              />
            </dl>

            {supportAreas.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs text-slate">Required support areas</p>
                <div className="flex flex-wrap gap-2">
                  {supportAreas.map((a) => (
                    <span key={a.id} className="rounded-full bg-paper px-2.5 py-1 text-xs text-ink">
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {candidate.additional_support && (
              <div className="mt-5">
                <p className="mb-1 text-xs text-slate">Additional requirements</p>
                <p className="text-sm text-ink">{candidate.additional_support}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
          <JobAccessCard candidateId={candidate.id} approved={!!candidate.job_approved} />
          {/* Placement */}
          <div className="rounded-2xl border border-line bg-card shadow-card p-5">
            <h3 className="mb-4 font-display text-base text-ink">Placement</h3>
            {placements.length === 0 ? (
              <p className="text-sm text-slate">No placement record yet.</p>
            ) : (
              placements.map((p, i) => (
                <div key={i} className="mb-3 text-sm last:mb-0">
                  <p className="font-medium text-ink">{(p as { company_name?: string }).company_name}</p>
                  <p className="text-slate">{(p as { designation?: string }).designation}</p>
                  <p className="text-xs capitalize text-slate">
                    {(p as { employment_type?: string }).employment_type?.replace("_", " ")}
                  </p>
                  <p className="text-xs text-slate">
                    {(p as { joining_date?: string }).joining_date
                      ? new Date((p as { joining_date: string }).joining_date).toLocaleDateString("en-IN")
                      : ""}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-paper px-2.5 py-1 text-xs capitalize text-ink">
                    {(p as { placement_status?: string }).placement_status?.replace("_", " ")}
                  </span>
                </div>
              ))
            )}
          </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card shadow-card p-5">
          <h3 className="mb-4 font-display text-base text-ink">Mock interview history</h3>
          {mockInterviews.length === 0 ? (
            <p className="text-sm text-slate">No mock interviews booked yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {mockInterviews.map((iv) => (
                <li key={iv.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="text-ink">
                      {new Date(iv.scheduled_start.replace(" ", "T")).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-slate">
                      {iv.mode} · {iv.interviewer_display_name}
                      {iv.result ? ` · ${iv.result.replace("_", " ")}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-paper px-2.5 py-1 text-xs capitalize text-ink">
                    {iv.status.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate">{label}</dt>
      <dd className="mt-0.5 capitalize text-ink">{value}</dd>
    </div>
  );
}
