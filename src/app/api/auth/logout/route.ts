// POST /api/auth/logout — FR-007: destroys the session cookie (stateless JWT, no server store).
import { clearSessionCookie } from "@/lib/session";
import { jsonOk, checkOrigin } from "@/lib/api";

export async function POST(req: Request) {
  const originErr = checkOrigin(req);
  if (originErr) return originErr;
  return clearSessionCookie(jsonOk({ ok: true }));
}