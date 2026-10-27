import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { getDashboardStats } from "@/lib/queries";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    return errorResponse(err);
  }
}
