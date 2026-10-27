import "server-only";
import { odooCall, readGroup, searchRead } from "./odoo";
import { PIPELINE_STAGES, type Candidate, type InterviewSlot, type MockInterview } from "./types";

export async function getDashboardStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);
  const fmt = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");

  const [stageGroups, slotsToday, interviewsToday, pendingReattempts, placementsThisMonth] =
    await Promise.all([
      readGroup("otm.placement.candidate", [["active", "=", true]], ["stage"], ["stage"]),
      searchRead(
        "otm.placement.interview.slot",
        [["date", "=", todayStart.toISOString().slice(0, 10)], ["active", "=", true]],
        ["id"]
      ),
      searchRead(
        "otm.placement.mock.interview",
        [
          ["scheduled_start", ">=", fmt(todayStart)],
          ["scheduled_start", "<=", fmt(todayEnd)],
          ["status", "in", ["scheduled", "confirmed"]],
        ],
        ["id"]
      ),
      searchRead(
        "otm.placement.reschedule.request",
        [["request_type", "=", "reattempt"], ["status", "=", "requested"]],
        ["id"]
      ),
      odooCall<number>("otm.placement.record", "search_count", {
        domain: [
          ["placement_status", "=", "placed"],
          ["joining_date", ">=", `${new Date().toISOString().slice(0, 7)}-01`],
        ],
      }),
    ]);

  const stage_counts: Record<string, number> = {};
  for (const stage of PIPELINE_STAGES) stage_counts[stage] = 0;
  for (const g of stageGroups as unknown as { stage: string; __count?: number; stage_count?: number }[]) {
    stage_counts[g.stage] = (g.__count ?? g.stage_count ?? 0) as number;
  }
  const total_candidates = Object.values(stage_counts).reduce((a, b) => a + b, 0);

  return {
    total_candidates,
    stage_counts,
    slots_today: slotsToday.length,
    interviews_today: interviewsToday.length,
    pending_reattempts: pendingReattempts.length,
    placements_this_month: placementsThisMonth,
  };
}

const CANDIDATE_LIST_FIELDS = [
  "name",
  "candidate_reference",
  "email",
  "phone",
  "stage",
  "program_id",
  "employment_status",
  "interview_preference",
  "interview_progress_status",
  "registration_date",
];

export async function getCandidates(opts: {
  stage?: string;
  q?: string;
  limit?: number;
  offset?: number;
}) {
  const domain: unknown[] = [["active", "=", true]];
  if (opts.stage) domain.push(["stage", "=", opts.stage]);
  if (opts.q) {
    domain.push("|", "|", ["name", "ilike", opts.q], ["email", "ilike", opts.q], ["phone", "ilike", opts.q]);
  }
  const [candidates, total] = await Promise.all([
    searchRead<Candidate>("otm.placement.candidate", domain, CANDIDATE_LIST_FIELDS, {
      order: "registration_date desc",
      limit: opts.limit ?? 50,
      offset: opts.offset ?? 0,
    }),
    odooCall<number>("otm.placement.candidate", "search_count", { domain }),
  ]);
  return { candidates, total };
}

const SLOT_FIELDS = [
  "name",
  "date",
  "start_datetime",
  "end_datetime",
  "mode",
  "capacity",
  "booked_count",
  "available_count",
  "slot_status",
  "interviewer_display_name",
  "venue",
  "meeting_platform",
];

export async function getSlots(opts: { mode?: string; from?: string } = {}) {
  const domain: unknown[] = [["active", "=", true]];
  if (opts.mode) domain.push(["mode", "=", opts.mode]);
  if (opts.from) domain.push(["date", ">=", opts.from]);
  return searchRead<InterviewSlot>("otm.placement.interview.slot", domain, SLOT_FIELDS, {
    order: "start_datetime",
    limit: 200,
  });
}

const INTERVIEW_FIELDS = [
  "candidate_id",
  "slot_id",
  "mode",
  "interviewer_display_name",
  "scheduled_start",
  "scheduled_end",
  "status",
  "result",
];

const CANDIDATE_DETAIL_FIELDS = [
  "name",
  "candidate_reference",
  "email",
  "phone",
  "stage",
  "program_id",
  "admission_year",
  "qualification_status",
  "employment_status",
  "company_name",
  "designation",
  "interview_preference",
  "support_area_ids",
  "additional_support",
  "interview_progress_status",
  "mock_interview_count",
  "placement_record_count",
  "registration_date",
  "erp_check_status",
];

export async function getCandidateDetail(id: number) {
  const [[candidate], mockInterviews, placements] = await Promise.all([
    searchRead<Candidate>("otm.placement.candidate", [["id", "=", id]], CANDIDATE_DETAIL_FIELDS),
    searchRead<MockInterview>(
      "otm.placement.mock.interview",
      [["candidate_id", "=", id]],
      ["scheduled_start", "scheduled_end", "mode", "interviewer_display_name", "status", "result"],
      { order: "scheduled_start desc" }
    ),
    searchRead(
      "otm.placement.record",
      [["candidate_id", "=", id]],
      ["company_name", "designation", "employment_type", "joining_date", "placement_status"]
    ),
  ]);

  let supportAreas: { id: number; name: string }[] = [];
  if (candidate?.support_area_ids && candidate.support_area_ids.length > 0) {
    supportAreas = await searchRead<{ id: number; name: string }>(
      "otm.placement.support.area",
      [["id", "in", candidate.support_area_ids]],
      ["name"]
    );
  }

  return { candidate, mockInterviews, placements, supportAreas };
}

export async function getProgramBreakdown() {
  const rows = await readGroup(
    "otm.placement.candidate",
    [["active", "=", true]],
    ["program_id"],
    ["program_id"]
  );
  return (rows as unknown as { program_id: [number, string] | false; __count?: number }[])
    .filter((r) => r.program_id)
    .map((r) => ({ label: (r.program_id as [number, string])[1], count: r.__count ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

export async function getEmploymentBreakdown() {
  const rows = await readGroup(
    "otm.placement.candidate",
    [["active", "=", true]],
    ["employment_status"],
    ["employment_status"]
  );
  const labels: Record<string, string> = { jobseeker: "Jobseeker", employed: "Employed", intern: "Intern" };
  return (rows as unknown as { employment_status: string | false; __count?: number }[])
    .filter((r) => r.employment_status)
    .map((r) => ({
      label: labels[r.employment_status as string] || (r.employment_status as string),
      count: r.__count ?? 0,
    }));
}

export async function getInterviewStatusBreakdown() {
  const rows = await readGroup("otm.placement.mock.interview", [], ["status"], ["status"]);
  return (rows as unknown as { status: string; __count?: number }[]).map((r) => ({
    label: r.status.replace("_", " "),
    count: r.__count ?? 0,
  }));
}

export async function getModeBreakdown() {
  const rows = await readGroup(
    "otm.placement.candidate",
    [["active", "=", true], ["interview_preference", "!=", false]],
    ["interview_preference"],
    ["interview_preference"]
  );
  return (rows as unknown as { interview_preference: string | false; __count?: number }[])
    .filter((r) => r.interview_preference)
    .map((r) => ({ label: r.interview_preference as string, count: r.__count ?? 0 }));
}

/** Slot counts per calendar day for a given month, for the dashboard mini-calendar. */
export async function getMonthSlotCounts(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const rows = await searchRead<{ date: string }>(
    "otm.placement.interview.slot",
    [["date", ">=", from], ["date", "<=", to], ["active", "=", true]],
    ["date"]
  );
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.date] = (counts[row.date] || 0) + 1;
  }
  return counts;
}

export async function getInterviews(opts: { status?: string; from?: string } = {}) {
  const domain: unknown[] = [];
  if (opts.status) domain.push(["status", "=", opts.status]);
  if (opts.from) domain.push(["scheduled_start", ">=", opts.from]);
  return searchRead<MockInterview>("otm.placement.mock.interview", domain, INTERVIEW_FIELDS, {
    order: "scheduled_start desc",
    limit: 200,
  });
}
