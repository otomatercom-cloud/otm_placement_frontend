export type CandidateStage =
  | "new"
  | "reviewed"
  | "contacted"
  | "interview_scheduled"
  | "interview_completed"
  | "follow_up"
  | "placement"
  | "cancelled"
  | "not_interested";

export const STAGE_LABELS: Record<CandidateStage, string> = {
  new: "New",
  reviewed: "Reviewed",
  contacted: "Contacted",
  interview_scheduled: "Interview Scheduled",
  interview_completed: "Interview Completed",
  follow_up: "Follow-up",
  placement: "Placement",
  cancelled: "Cancelled",
  not_interested: "Not Interested",
};

/** The genuine, ordered pipeline funnel shown as the dashboard's "pipeline strip". */
export const PIPELINE_STAGES: CandidateStage[] = [
  "new",
  "reviewed",
  "contacted",
  "interview_scheduled",
  "placement",
];

export interface Candidate {
  id: number;
  name: string;
  candidate_reference: string;
  email: string;
  phone: string;
  stage: CandidateStage;
  program_id: [number, string] | false;
  employment_status: "jobseeker" | "employed" | "intern" | false;
  interview_preference: "online" | "offline" | false;
  interview_progress_status: string;
  registration_date: string;
  access_token?: string;
  job_approved?: boolean;
  admission_year?: string | false;
  qualification_status?: "partly_qualified" | "fully_qualified" | "not_qualified" | false;
  company_name?: string | false;
  designation?: string | false;
  support_area_ids?: number[];
  additional_support?: string | false;
  mock_interview_count?: number;
  placement_record_count?: number;
  erp_check_status?:
    | "not_checked"
    | "unavailable"
    | "not_found"
    | "lead_only"
    | "current_student"
    | "old_student"
    | false;
}

export interface InterviewSlot {
  id: number;
  name: string;
  date: string;
  start_datetime: string;
  end_datetime: string;
  mode: "online" | "offline";
  capacity: number;
  booked_count: number;
  available_count: number;
  slot_status: "available" | "full" | "past";
  interviewer_display_name: string;
  venue: string | false;
  meeting_platform: string | false;
}

export interface MockInterview {
  id: number;
  candidate_id: [number, string];
  slot_id: [number, string] | false;
  mode: "online" | "offline";
  interviewer_display_name: string;
  scheduled_start: string;
  scheduled_end: string;
  status:
    | "scheduled"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no_show"
    | "rescheduled";
  result:
    | "needs_improvement"
    | "interview_ready"
    | "follow_up_required"
    | "recommended"
    | false;
}

export interface DashboardStats {
  total_candidates: number;
  stage_counts: Record<string, number>;
  slots_today: number;
  interviews_today: number;
  pending_reattempts: number;
  placements_this_month: number;
}

export type JobState = "draft" | "published" | "closed";
export type JobApplicationState = "applied" | "shortlisted" | "selected" | "rejected";

export interface JobOpening {
  id: number;
  name: string;
  company_name: string;
  location: string | false;
  employment_type: "full_time" | "part_time" | "internship" | "contract";
  salary_range: string | false;
  openings: number;
  description: string | false;
  requirements: string | false;
  program_ids: number[];
  last_date: string | false;
  apply_link: string | false;
  state: JobState;
  published_date: string | false;
  application_count: number;
}

export interface JobApplication {
  id: number;
  candidate_id: [number, string];
  state: JobApplicationState;
  applied_date: string;
  note: string | false;
}

export const EMPLOYMENT_TYPE_LABELS: Record<JobOpening["employment_type"], string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  internship: "Internship",
  contract: "Contract",
};
