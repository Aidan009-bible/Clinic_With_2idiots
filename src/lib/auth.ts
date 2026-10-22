import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

import type { AuthSession, Role } from "@/lib/types";

const SESSION_COOKIE = "clinic_demo_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function sessionSecret() {
  const secret = process.env.CLINIC_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

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

  const secret = sessionSecret();
  if (!secret) return null;

  try {
    const [payload, signature] = value.split(".");
    if (!payload || !signature) return null;
    const expected = Buffer.from(sign(payload, secret));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthSession & { exp?: number };
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) return null;
    if (!["admin", "doctor", "reception"].includes(decoded.role) || typeof decoded.username !== "string") return null;
    return { username: decoded.username, role: decoded.role };
  } catch {
    return null;
  }
}

export function encodeSession(session: AuthSession) {
  const secret = sessionSecret();
  if (!secret) throw new Error("Set CLINIC_SESSION_SECRET to a random value of at least 32 characters.");
  const payload = Buffer.from(JSON.stringify({ ...session, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS }), "utf8").toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
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
