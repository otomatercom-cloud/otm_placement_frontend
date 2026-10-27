import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { write } from "@/lib/odoo";
import { getCandidateDetail } from "@/lib/queries";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/candidates/[id]">
) {
  try {
    const { id } = await params;
    const data = await getCandidateDetail(Number(id));
    if (!data.candidate) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext<"/api/candidates/[id]">
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const allowed = ["stage", "employment_status", "company_name", "designation"];
    const vals: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) vals[key] = body[key];
    }
    await write("otm.placement.candidate", [Number(id)], vals);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
