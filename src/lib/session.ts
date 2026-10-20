// src/lib/session.ts — JWT session primitives (edge-safe: jose only, no Node/bcrypt imports).
// Contract (PLAN.md §Interface Contract): cookie "rsu_session", JWT HS256, payload {sub, role, name}, 7d.
// NFR-005: httpOnly + SameSite=Lax + Secure in production.
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { Role } from "./types";

export const SESSION_COOKIE = "rsu_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7d

export interface SessionPayload {
  /** User id (as string, per JWT `sub`). */
  sub: string;
  role: Role;
  /** Display name = username (faculty login name / student name / admin name). */
  name: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET is missing or too short (need ≥32 chars). Did you create .env?");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role;
    if (typeof payload.sub !== "string" || typeof payload.name !== "string") return null;
    if (role !== "ADMIN" && role !== "FACULTY" && role !== "STUDENT") return null;
    return { sub: payload.sub, role, name: payload.name };
  } catch {
    return null; // expired/tampered → treated as unauthenticated
  }
}

/** Read + verify the session from the request cookie store (route handlers / server components). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Session for middleware (edge runtime): reads the cookie from a plain Request. */
export async function getSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;
  return verifySession(decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)));
}

/** Shared cookie options. */
export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/** Attach the session cookie to a response. */
export function setSessionCookie(res: NextResponse, token: string): NextResponse {
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE_SECONDS));
  return res;
}

/** Destroy the session cookie (FR-007: logout = cookie destruction; stateless JWT, no server store). */
export function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return res;
}

/** Dashboard path for a role (middleware redirect target). */
export function dashboardPath(role: Role): string {
  return `/${role.toLowerCase()}`;
}