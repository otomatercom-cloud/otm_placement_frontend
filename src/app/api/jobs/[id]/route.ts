import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { callMethod, write } from "@/lib/odoo";

const ACTIONS: Record<string, string> = {
  publish: "action_publish",
  close: "action_close",
  draft: "action_set_draft",
};

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext<"/api/jobs/[id]">
) {
  try {
    const { id } = await params;
    const { action } = await req.json();
    const method = ACTIONS[action as string];
    if (!method) {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
    await callMethod("otm.placement.job.opening", method, { ids: [Number(id)] });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext<"/api/jobs/[id]">
) {
  try {
    const { id } = await params;
    // Archive (soft delete) instead of hard delete.
    await write("otm.placement.job.opening", [Number(id)], { active: false });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
