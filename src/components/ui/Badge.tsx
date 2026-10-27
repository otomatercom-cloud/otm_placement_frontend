import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-paper text-slate",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-amber",
  danger: "bg-danger-bg text-rose",
  info: "bg-info-bg text-brand",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// ----------------------------------------------------------------------
// StatusBadge — the single place mapping a placement-domain status
// string to a label + tone, so every page shows the same badge for the
// same status instead of ad-hoc per-page color records.
// ----------------------------------------------------------------------
const STAGE_STATUS: Record<string, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "neutral" },
  reviewed: { label: "Reviewed", tone: "info" },
  contacted: { label: "Contacted", tone: "info" },
  interview_scheduled: { label: "Interview Scheduled", tone: "warning" },
  interview_completed: { label: "Interview Completed", tone: "info" },
  follow_up: { label: "Follow-up", tone: "warning" },
  placement: { label: "Placement", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
  not_interested: { label: "Not Interested", tone: "neutral" },
};

const INTERVIEW_STATUS: Record<string, { label: string; tone: Tone }> = {
  scheduled: { label: "Scheduled", tone: "info" },
  confirmed: { label: "Confirmed", tone: "success" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
  no_show: { label: "No Show", tone: "warning" },
  rescheduled: { label: "Rescheduled", tone: "warning" },
};

const SLOT_STATUS: Record<string, { label: string; tone: Tone }> = {
  available: { label: "Available", tone: "success" },
  full: { label: "Full", tone: "warning" },
  past: { label: "Past", tone: "neutral" },
};

const MAPS = {
  stage: STAGE_STATUS,
  interview: INTERVIEW_STATUS,
  slot: SLOT_STATUS,
} as const;

export function StatusBadge({
  domain,
  status,
  className,
}: {
  domain: keyof typeof MAPS;
  status: string;
  className?: string;
}) {
  const entry = MAPS[domain][status] ?? { label: status, tone: "neutral" as Tone };
  return (
    <Badge tone={entry.tone} className={className}>
      {entry.label}
    </Badge>
  );
}
