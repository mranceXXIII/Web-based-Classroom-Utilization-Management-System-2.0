// src/lib/rate-limit.ts — in-memory sliding-window limiter (FIND-001, CWE-307; SECURITY-ASSESSMENT.md §3).
// Scope: PER-PROCESS ONLY (Map in module memory) — correct for the single-node dev/intranet
// deployment class of this app; a multi-node deployment needs a shared store (documented in
// docs/API-CONTRACT.md). Counts FAILED login attempts per username+IP; successful logins reset.
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 10;

type Attempt = { count: number; windowStart: number };

const globalForLimiter = globalThis as unknown as { loginAttempts?: Map<string, Attempt> };
const attempts: Map<string, Attempt> =
  globalForLimiter.loginAttempts ?? new Map<string, Attempt>();
globalForLimiter.loginAttempts = attempts; // survive HMR/dev reloads

/** Best-effort client IP (first x-forwarded-for hop) — dev/intranet proxy convention. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function keyFor(username: string, ip: string): string {
  return `${username.toLowerCase()}|${ip}`;
}

/** Record a FAILED attempt. Returns true if the caller is now over the limit. */
export function recordFailedAttempt(username: string, ip: string): boolean {
  const key = keyFor(username, ip);
  const now = Date.now();
  let entry = attempts.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    entry = { count: 0, windowStart: now };
    attempts.set(key, entry);
  }
  entry.count += 1;
  // Opportunistic cleanup to keep the map bounded.
  if (attempts.size > 10_000) {
    for (const [k, v] of attempts) {
      if (now - v.windowStart >= WINDOW_MS) attempts.delete(k);
    }
  }
  return entry.count > MAX_FAILED_ATTEMPTS;
}

/** A successful login resets the failure counter for that username+IP. */
export function resetAttempts(username: string, ip: string): void {
  attempts.delete(keyFor(username, ip));
}

/** Whether the username+IP is currently blocked (10+ failures inside the window). */
export function isBlocked(username: string, ip: string): boolean {
  const entry = attempts.get(keyFor(username, ip));
  if (!entry) return false;
  if (Date.now() - entry.windowStart >= WINDOW_MS) {
    attempts.delete(keyFor(username, ip));
    return false;
  }
  return entry.count > MAX_FAILED_ATTEMPTS;
}