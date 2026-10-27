"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { Badge, Button, Card, CardHeader, CardTitle } from "@/components/ui";

export default function JobAccessCard({
  candidateId,
  approved,
}: {
  candidateId: number;
  approved: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/job-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve: !approved }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update job access.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update job access.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job access</CardTitle>
        <Badge tone={approved ? "success" : "neutral"}>{approved ? "Approved" : "Not approved"}</Badge>
      </CardHeader>
      <p className="mb-4 text-sm text-slate">
        {approved
          ? "This candidate can see published job openings and apply."
          : "Approve this candidate so they can see published job openings and apply."}
      </p>
      {error && <p className="mb-3 text-sm text-rose">{error}</p>}
      <Button
        size="sm"
        variant={approved ? "secondary" : "primary"}
        loading={loading}
        onClick={toggle}
        icon={<Briefcase className="h-4 w-4" />}
      >
        {approved ? "Revoke job access" : "Approve for jobs"}
      </Button>
    </Card>
  );
}
