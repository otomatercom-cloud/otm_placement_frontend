import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { getSlots } from "@/lib/queries";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slots = await getSlots({
      mode: searchParams.get("mode") || undefined,
      from: searchParams.get("from") || undefined,
    });
    return NextResponse.json({ slots });
  } catch (err) {
    return errorResponse(err);
  }
}
