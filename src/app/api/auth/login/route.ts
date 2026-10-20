// POST /api/auth/login — FR-002/FR-003. Generic 401 on any failure (no user enumeration).
// FIND-001 remediation: sliding-window lockout — 10 failed attempts per username+IP per 15 min →
// 429 (generic message); success resets. Per-process limiter (single-node dev/intranet scope).
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { jsonOk, jsonError, parseJson, internalError, findUserByUsername, checkOrigin } from "@/lib/api";
import { toUserDTO } from "@/lib/serialize";
import { loginSchema } from "@/lib/schemas";
import { clientIp, isBlocked, recordFailedAttempt, resetAttempts } from "@/lib/rate-limit";

const LOCKOUT_SECONDS = 15 * 60;

export async function POST(req: Request) {
  const originErr = checkOrigin(req);
  if (originErr) return originErr;
  const parsed = await parseJson(req, loginSchema);
  if ("err" in parsed) return parsed.err;
  const { role, username, password } = parsed.data;
  const ip = clientIp(req);
  if (isBlocked(username, ip)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(LOCKOUT_SECONDS) } }
    );
  }
  try {
    const user = await findUserByUsername(username);
    if (!user || !verifyPassword(password, user.passwordHash) || user.role !== role) {
      recordFailedAttempt(username, ip);
      return jsonError(401, "Invalid credentials");
    }
    resetAttempts(username, ip);
    const token = await signSession({ sub: String(user.id), role: user.role, name: user.username });
    const res = jsonOk({ user: toUserDTO(user) });
    return setSessionCookie(res, token);
  } catch (e) {
    return internalError(e);
  }
}