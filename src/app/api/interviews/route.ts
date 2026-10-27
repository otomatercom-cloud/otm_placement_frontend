import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { getInterviews } from "@/lib/queries";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const interviews = await getInterviews({
      status: searchParams.get("status") || undefined,
      from: searchParams.get("from") || undefined,
    });
    return NextResponse.json({ interviews });
  } catch (err) {
    return errorResponse(err);
  }
}
