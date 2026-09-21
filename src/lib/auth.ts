import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthSession, Role } from "@/lib/types";

const SESSION_COOKIE = "clinic_demo_session";

export function getRoleHome(role: Role) {
  if (role === "admin") {
    return "/admin/overview";
  }

  if (role === "reception") {
    return "/reception/overview";
  }

  return "/doctor/overview";
}

export async function getSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AuthSession;
  } catch {
    return null;
  }
}

export function encodeSession(session: AuthSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export async function requireSession(allowedRoles?: Role[]) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect(getRoleHome(session.role));
  }

  return session;
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
