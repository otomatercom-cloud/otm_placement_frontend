import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { odooBffCall } from "@/lib/odoo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await odooBffCall("/api/placement/candidates/lookup", {
      method: "POST",
      body,
    });
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
