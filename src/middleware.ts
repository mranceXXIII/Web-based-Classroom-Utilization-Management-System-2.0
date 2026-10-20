// src/middleware.ts — route guards (ARCHITECTURE §4, FR-007).
// /admin/** → ADMIN, /faculty/** → FACULTY, /student/** → STUDENT.
// Unauthenticated → /login/<role of the path>; wrong role → own dashboard;
// logged-in users hitting /login/* or /register/* → their dashboard.
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest, dashboardPath, type SessionPayload } from "@/lib/session";
import type { Role } from "@/lib/types";

const PATH_ROLES: Record<string, Role> = {
  admin: "ADMIN",
  faculty: "FACULTY",
  student: "STUDENT",
};

function roleFromPath(pathname: string): Role | null {
  const seg = pathname.split("/")[1]?.toLowerCase();
  return seg ? PATH_ROLES[seg] ?? null : null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session: SessionPayload | null = await getSessionFromRequest(req);

  // Login/register pages: bounce logged-in users to their dashboard.
  const firstSeg = pathname.split("/")[1]?.toLowerCase();
  if (firstSeg === "login" || firstSeg === "register") {
    if (session) {
      return NextResponse.redirect(new URL(dashboardPath(session.role), req.url));
    }
    return NextResponse.next();
  }

  const requiredRole = roleFromPath(pathname);
  if (!requiredRole) return NextResponse.next(); // not a guarded area (landing etc.)

  if (!session) {
    const loginUrl = new URL(`/login/${requiredRole.toLowerCase()}`, req.url);
    return NextResponse.redirect(loginUrl);
  }
  if (session.role !== requiredRole) {
    return NextResponse.redirect(new URL(dashboardPath(session.role), req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/faculty/:path*",
    "/student/:path*",
    "/login/:path*",
    "/register/:path*",
  ],
};