import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { odooBffCall } from "@/lib/odoo";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    const data = await odooBffCall("/api/placement/candidates/status", {
      query: { token },
    });
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
