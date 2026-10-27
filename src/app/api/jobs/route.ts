import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { callMethod, create } from "@/lib/odoo";

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.name?.trim() || !b.company_name?.trim()) {
      return NextResponse.json({ error: "Job title and company are required." }, { status: 400 });
    }
    const programIds: number[] = Array.isArray(b.program_ids) ? b.program_ids.map(Number) : [];
    const id = await create("otm.placement.job.opening", {
      name: b.name.trim(),
      company_name: b.company_name.trim(),
      location: b.location || false,
      employment_type: b.employment_type || "full_time",
      salary_range: b.salary_range || false,
      openings: Number(b.openings) || 1,
      description: b.description || false,
      requirements: b.requirements || false,
      apply_link: b.apply_link || false,
      last_date: b.last_date || false,
      program_ids: [[6, 0, programIds]],
    });
    if (b.publish) {
      await callMethod("otm.placement.job.opening", "action_publish", { ids: [id] });
    }
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return errorResponse(err);
  }
}
