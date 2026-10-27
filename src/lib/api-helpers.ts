import { NextResponse } from "next/server";
import { OdooError } from "./odoo";

export function errorResponse(err: unknown) {
  if (err instanceof OdooError) {
    const status = err.status >= 400 && err.status < 600 ? err.status : 502;
    return NextResponse.json({ error: err.message }, { status });
  }
  console.error(err);
  return NextResponse.json(
    { error: "Something went wrong talking to Odoo." },
    { status: 500 }
  );
}
