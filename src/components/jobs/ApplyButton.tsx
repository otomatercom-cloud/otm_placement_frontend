"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui";

export default function ApplyButton({
  candidateId,
  jobId,
  token,
  applied,
}: {
  candidateId: number;
  jobId: number;
  token: string;
  applied: boolean;
}) {
  const [done, setDone] = useState(applied);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success">
        <Check className="h-4 w-4" /> Applied
      </span>
    );
  }

  async function apply() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId, job_id: jobId, token }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Could not apply. Try again.");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not apply. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button size="sm" loading={loading} onClick={apply}>
        Apply now
      </Button>
      {error && <p className="mt-2 text-sm text-rose">{error}</p>}
    </div>
  );
}
