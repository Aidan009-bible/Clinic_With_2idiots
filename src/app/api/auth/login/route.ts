import { NextResponse } from "next/server";

import { encodeSession, getRoleHome, getSessionCookieName } from "@/lib/auth";
import { authenticateDemoUser } from "@/lib/clinic-server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const user = await authenticateDemoUser(body.username ?? "", body.password ?? "");

  if (!user) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const response = NextResponse.json({
    redirectTo: getRoleHome(user.role),
  });

  let signedSession: string;
  try {
    signedSession = encodeSession({ username: user.username, role: user.role });
  } catch {
    return NextResponse.json({ error: "Demo session configuration is missing." }, { status: 503 });
  }

  response.cookies.set(getSessionCookieName(), signedSession, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return response;
}
