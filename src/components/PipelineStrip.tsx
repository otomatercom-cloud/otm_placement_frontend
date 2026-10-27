import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import AnimatedNumber from "./AnimatedNumber";

const STAGE_COLORS: Record<string, string> = {
  new: "#7d8799",
  reviewed: "#0891b2",
  contacted: "#0891b2",
  interview_scheduled: "#ff7600",
  placement: "#08c85a",
};

export default function PipelineStrip({
  counts,
}: {
  counts: Record<string, number>;
}) {
  return (
    <div className="flex items-stretch overflow-x-auto rounded-2xl border border-line bg-card shadow-card">
      {PIPELINE_STAGES.map((stage, i) => (
        <div key={stage} className="flex items-stretch">
          <Link
            href={`/candidates?stage=${stage}`}
            className="flex min-w-[132px] flex-col gap-1 px-5 py-4 transition-colors hover:bg-paper"
          >
            <span
              className="h-1.5 w-8 rounded-full"
              style={{ background: STAGE_COLORS[stage] }}
            />
            <span className="text-2xl font-semibold text-ink">
              <AnimatedNumber value={counts[stage] ?? 0} />
            </span>
            <span className="text-xs text-slate">{STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}</span>
          </Link>
          {i < PIPELINE_STAGES.length - 1 && (
            <div className="flex items-center text-line">
              <ChevronRight size={16} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
