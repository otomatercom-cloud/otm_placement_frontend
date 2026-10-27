import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { callMethod } from "@/lib/odoo";

export async function POST(
  req: NextRequest,
  { params }: RouteContext<"/api/candidates/[id]/job-access">
) {
  try {
    const { id } = await params;
    const { approve } = await req.json();
    await callMethod(
      "otm.placement.candidate",
      approve ? "action_approve_job_access" : "action_revoke_job_access",
      { ids: [Number(id)] }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
