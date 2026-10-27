import { NextRequest, NextResponse } from "next/server";
import { authenticateStaff } from "@/lib/odoo-auth";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json();
    if (!login || !password) {
      return NextResponse.json({ error: "Enter your username and password." }, { status: 400 });
    }

    const user = await authenticateStaff(login, password);
    if (!user) {
      return NextResponse.json(
        { error: "Incorrect credentials, or this account isn't placement staff." },
        { status: 401 }
      );
    }

    const token = createSessionToken({ uid: user.uid, name: user.name, login });
    const res = NextResponse.json({ ok: true, name: user.name });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not reach Odoo to sign in." }, { status: 502 });
  }
}
