// src/lib/auth.ts — password hashing (bcryptjs) + re-exports of the session primitives.
// bcryptjs verifies legacy PHP $2y$ hashes (TECH-STACK.md). Cost 10 (NFR-005).
import bcrypt from "bcryptjs";

export {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifySession,
  getSession,
  setSessionCookie,
  clearSessionCookie,
  dashboardPath,
  type SessionPayload,
} from "./session";

export const BCRYPT_COST = 10;

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, BCRYPT_COST);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

/**
 * Guard helper for API routes: returns the session if the role matches, else null.
 * Callers respond 401 (no session) or 403 (wrong role) — see src/lib/api.ts helpers.
 */
export function requireRole(
  session: import("./session").SessionPayload | null,
  ...allowed: import("./types").Role[]
): import("./session").SessionPayload | null {
  if (!session) return null;
  return allowed.includes(session.role) ? session : null;
}