"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import type { JobState } from "@/lib/types";

export default function JobActions({ id, state }: { id: number; state: JobState }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "publish" | "close" | "draft") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {state !== "published" && (
        <Button size="sm" loading={loading === "publish"} onClick={() => run("publish")}>
          Publish
        </Button>
      )}
      {state === "published" && (
        <Button size="sm" variant="secondary" loading={loading === "close"} onClick={() => run("close")}>
          Close
        </Button>
      )}
      {state !== "draft" && (
        <Button size="sm" variant="ghost" loading={loading === "draft"} onClick={() => run("draft")}>
          Move to draft
        </Button>
      )}
      {error && <span className="text-sm text-rose">{error}</span>}
    </div>
  );
}
