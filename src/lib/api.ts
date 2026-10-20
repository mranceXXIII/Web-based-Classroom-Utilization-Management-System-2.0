// src/lib/api.ts — API envelope + guards (PLAN.md: success { data }, error { error, fields? }).
import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { getSession, type SessionPayload } from "./session";
import { db } from "./db";
import type { Role } from "./types";

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function jsonError(
  status: number,
  error: string,
  fields?: Record<string, string>
): NextResponse {
  return NextResponse.json(fields ? { error, fields } : { error }, { status });
}

/** API guard: 401 unauthenticated, 403 wrong role. Also verifies the user still exists
 *  (a stateless JWT from a since-deleted account must not grant access). */
export async function guard(
  ...allowed: Role[]
): Promise<{ session: SessionPayload } | { err: NextResponse }> {
  const session = await getSession();
  if (!session) return { err: jsonError(401, "Authentication required") };
  const user = await db.user.findUnique({ where: { id: Number(session.sub) }, select: { id: true } });
  if (!user) return { err: jsonError(401, "Authentication required") };
  if (!allowed.includes(session.role)) return { err: jsonError(403, "Forbidden") };
  return { session };
}

/** Parse + validate a JSON body against a zod schema. */
export async function parseJson<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ data: T } | { err: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { err: jsonError(400, "Invalid JSON body") };
  }
  const result = schema.safeParse(raw);
  if (!result.success) return { err: zodToError(result.error) };
  return { data: result.data };
}

export function zodToError(error: ZodError): NextResponse {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!fields[key]) fields[key] = issue.message;
  }
  return jsonError(400, "Validation failed", fields);
}

/** Map unexpected route errors to the generic 500 envelope (no stack traces to clients). */
export function internalError(e: unknown): NextResponse {
  console.error("[api] internal error:", e);
  return jsonError(500, "Internal server error");
}

/** Case-insensitive fallback lookup helper (legacy MySQL used ci collation utf8mb4_general_ci). */
export function findByNameCi<T>(items: T[], nameOf: (t: T) => string, wanted: string): T | undefined {
  return (
    items.find((i) => nameOf(i) === wanted) ??
    items.find((i) => nameOf(i).toLowerCase() === wanted.toLowerCase())
  );
}

/** Find a user by username, exact first, then case-insensitive (legacy ci behavior). */
export async function findUserByUsername(username: string) {
  const exact = await db.user.findUnique({ where: { username } });
  if (exact) return exact;
  const all = await db.user.findMany();
  return all.find((u) => u.username.toLowerCase() === username.toLowerCase()) ?? null;
}

/**
 * CSRF defense-in-depth for state-changing requests (FIND-006, CWE-352; SECURITY-ASSESSMENT.md §3).
 * SameSite=Lax on the session cookie remains the primary defense; this rejects the residual paths
 * (same-site subdomain attackers, non-conforming browsers). Rules:
 *  - `Sec-Fetch-Site: cross-site` → 403.
 *  - `Origin` present and its host differs from the request `Host` → 403 (invalid Origin → 403).
 *  - No Origin (non-browser clients, curl, server-to-server) → allowed.
 * Returns null when the request is acceptable, else the 403 response.
 */
export function checkOrigin(req: Request): NextResponse | null {
  const site = req.headers.get("sec-fetch-site");
  if (site === "cross-site") return jsonError(403, "Cross-site request rejected");
  const origin = req.headers.get("origin");
  if (!origin) return null;
  try {
    const originHost = new URL(origin).host;
    const host = req.headers.get("host");
    if (!host || originHost !== host) return jsonError(403, "Cross-origin request rejected");
  } catch {
    return jsonError(403, "Invalid Origin header");
  }
  return null;
}