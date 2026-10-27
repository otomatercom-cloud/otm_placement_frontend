import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { odooBffCall } from "@/lib/odoo";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "";
    const date = searchParams.get("date") || "";
    const query: Record<string, string> = { mode };
    if (date) query.date = date;
    const data = await odooBffCall("/api/placement/slots", { query });
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
