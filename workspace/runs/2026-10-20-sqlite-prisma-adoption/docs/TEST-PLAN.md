# TEST-PLAN — Gate G5 Verification (Adopted Root App)

_Run: 2026-10-20-sqlite-prisma-adoption · Owner: QA · Baseline: workspace/runs/2026-10-14-sqlite-prisma-ui-unification/docs/REQUIREMENTS.md (FR-001..FR-034, NFR-001..NFR-006)_

## Scope
Independent verification of the Next.js 15 + Prisma 6 + SQLite app adopted into the repo root
`E:\sideQuest\Web-based-Classroom-Utilization-Management-System-2.0`. QA verifies only — no code fixes (R8 / builder-verifier separation). A test is never weakened to go green.

## Environment & conventions
- Windows host. Use `G:\npm.cmd` / `G:\npx.cmd` full paths. 30s tool timeout → long commands backgrounded via `Start-Process` with log redirect + poll.
- HTTP via `Invoke-WebRequest / Invoke-RestMethod -UseBasicParsing`.
- Dev server: `G:\npm.cmd run dev` (port 3000), background, poll log for "Ready", killed via recorded PID tree afterwards.
- Seeded credentials (prisma/seed.ts): admin = `admin` / `admin123` (role ADMIN); faculty without legacy hash get `faculty123` (e.g. `Angelica Rico` / `faculty123`, role FACULTY). Login API body: `{ role, username, password }` (src/lib/schemas.ts loginSchema).
- Evidence logs saved under run folder `2026-10-20-sqlite-prisma-adoption/` (root) and `docs/` for reports.

## Test cases

| ID | Case | Method / expected result | FR / NFR trace |
|----|------|--------------------------|----------------|
| T-01 | Typecheck | `G:\npx.cmd tsc --noEmit` at repo root → exit 0, 0 errors; log saved as `g5-tsc-out.log` | NFR-001 |
| T-02 | Production build evidence | Review `build2-out.log`: "Compiled successfully", static gen 18/18, full route table (/, /admin + 6 sections, /faculty, /student, /login/[role], /register/[role], API routes, Middleware line) | NFR-001, FR-001..FR-023 (routes) |
| T-03 | Landing page | GET `/` → 200; HTML contains "Classroom Utilization Management System" and theme-toggle `aria-label` ("Switch to dark theme" or "Switch to light theme") | FR-001, FR-032 |
| T-04 | Login pages | GET `/login/admin`, `/login/faculty`, `/login/student` → all 200 | FR-002, FR-003 |
| T-05 | Auth guard (unauthenticated) | GET `/admin` without session cookie → 3xx redirect to `/login/admin` (middleware guard works) | FR-007 |
| T-06 | Login API — valid admin | POST `/api/auth/login` `{role:"ADMIN",username:"admin",password:"admin123"}` → 200 + `Set-Cookie` session; then GET `/admin` with cookie → 200 | FR-002, FR-003, NFR-005 |
| T-07 | Login API — wrong password | POST `/api/auth/login` valid username + wrong password → 401 "Invalid credentials" | FR-002, NFR-004 |
| T-08 | Role guard (wrong role) | Login as faculty (`Angelica Rico`/`faculty123`, role FACULTY) → 200 + cookie; GET `/admin` with FACULTY cookie → redirect (wrong role rejected), GET `/faculty` with same cookie → 200 | FR-007 |
| T-09 | Theme toggle — code + all 6 route groups | Code inspection: `src/app/layout.tsx` pre-hydration script reads localStorage key `theme`, falls back to `prefers-color-scheme`, toggles `.dark` on `<html>`; `theme-toggle.tsx` persists to `theme`. Runtime: GET `/`, `/login/admin`, `/register/admin`, `/admin`, `/faculty`, `/student` (authed where needed) → each 200 and HTML contains the toggle button `aria-label` | FR-032, FR-030 |
| T-10 | Requirements coverage sweep | Every FR-### mapped to ≥1 test id in TEST-REPORT.md; uncovered FRs explicitly marked NOT-TESTED with reason (G5 scope = smoke; deeper coverage at G7) | Traceability rule |

## Integrity rules
- R8: no test weakened to pass; failures reported verbatim to Leader.
- Negative results (4xx/5xx/redirects) are evidence, not obstacles — status lines captured as-is.
- Independent re-verification where cheap (typecheck re-run by QA, not trusted from builder logs).

## Exit criteria
- All T-01..T-09 executed with evidence; TEST-REPORT.md written with per-case pass/fail + FR traceability; task_0002 completed with artifact links.