import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { getCandidates } from "@/lib/queries";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await getCandidates({
      stage: searchParams.get("stage") || undefined,
      q: searchParams.get("q") || undefined,
      limit: Number(searchParams.get("limit") || 50),
      offset: Number(searchParams.get("offset") || 0),
    });
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
