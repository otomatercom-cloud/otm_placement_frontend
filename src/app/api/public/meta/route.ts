import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { odooBffCall } from "@/lib/odoo";

export async function GET() {
  try {
    const data = await odooBffCall("/api/placement/meta");
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
