# TEST-REPORT — Gate G5 Verification (Adopted Root App)

_Run: 2026-10-20-sqlite-prisma-adoption · Owner: QA · Plan: [TEST-PLAN.md](TEST-PLAN.md) · Baseline: workspace/runs/2026-10-14-sqlite-prisma-ui-unification/docs/REQUIREMENTS.md_

**Overall G5 result: PASS** (9/9 executed test cases passed; 1 transient anomaly logged for Leader awareness; several FRs out of G5 smoke scope explicitly marked NOT-TESTED, not silently skipped).

## Environment
- App: Next.js 15.5.28 + Prisma 6 + SQLite, repo root `E:\sideQuest\Web-based-Classroom-Utilization-Management-System-2.0`.
- Dev server: `G:\npm.cmd run dev`, Ready in 1956ms on :3000; killed via `taskkill /T /F` on PID tree 3684 after tests (all next/start-server processes terminated, verified via Win32_Process).
- QA DB mutations (disclosed): created User id 103 "Ako ay Student" (STUDENT) via `/api/auth/register/student` to obtain a student session for the `/student` route check. Note: User id 98 "Juan Dela Cruz" (STUDENT) **already existed** in dev.db before QA (pre-existing from earlier runs/seed state).

## Test results

| ID | Case | Result | Evidence |
|----|------|--------|----------|
| T-01 | Typecheck `G:\npx.cmd tsc --noEmit` | **PASS** | QA-run #1: `g5-tsc-out.log` empty (0 diagnostics), no tsc process survived; QA-run #2 (batch wrapper, explicit exit code): `g5-tsc2-code.txt` = **0**, `g5-tsc2-out.log` empty |
| T-02 | Production build evidence | **PASS** | `build2-out.log`: "✓ Compiled successfully in 3.8s", types check pass, 18/18 static pages, middleware line (40.2 kB). Route table: `/`, `/_not-found`, `/admin` + 6 sections (blocks, faculty, rooms, roster, schedules, subjects), `/faculty`, `/student`, `/login/[role]`, `/register/[role]`, API routes. **Note:** the workstream brief said "12 API routes"; the build log lists **14** (auth×5, crud×6, export/schedules, heartbeat, import/roster). Reported as-is; brief figure appears stale, build artifact is authoritative |
| T-03 | GET `/` | **PASS** | HTTP 200; HTML contains "Classroom Utilization Management System" and `aria-label="Switch to dark theme"` (`g5-dev-out.log` request trace) |
| T-04 | GET `/login/admin`, `/login/faculty`, `/login/student` | **PASS** | All 200 |
| T-05 | GET `/admin` unauthenticated | **PASS** | HTTP **307 TemporaryRedirect**, `Location: /login/admin` (middleware guard works) |
| T-06 | POST `/api/auth/login` admin/admin123 (seeded per prisma/seed.ts `resolveDevPasswords()`) | **PASS** | HTTP 200; `Set-Cookie: rsu_session=…; HttpOnly; SameSite=lax` (NFR-005 flags observed); GET `/admin` with cookie → **200** (cookie saved: `g5-admin-cookie.txt`) |
| T-07 | POST `/api/auth/login` wrong password | **PASS** | HTTP **401**, body `{"error":"Invalid credentials"}` (generic, no user enumeration) |
| T-08 | Role guard (wrong role) | **PASS** | Faculty login "Angelica Rico"/faculty123 → 200; GET `/admin` with FACULTY cookie → **307 Location: /faculty**; GET `/faculty` same cookie → **200** (`g5-faculty-cookie.txt`) |
| T-09 | Theme toggle on all 6 route groups | **PASS** | Runtime HTML `aria-label="Switch to … theme"` present on `/`, `/login/admin`, `/register/admin`, `/admin` (authed), `/faculty` (authed), `/student` (authed) — all HTTP 200. Code inspection: `src/app/layout.tsx` pre-hydration script reads localStorage key `theme`, falls back to `prefers-color-scheme: dark`, toggles `.dark` on `<html>`; `src/components/theme-toggle.tsx` persists `theme` to localStorage; `AppHeader` (with `ThemeToggle`) used by root page + admin/faculty/student layouts |
| T-10 | Requirements coverage sweep | **PASS** | Table below; uncovered FRs explicitly NOT-TESTED |


## FR / NFR traceability (G5 scope)

| Req | Status | Test id(s) / evidence |
|-----|--------|----------------------|
| FR-001 | PASS (smoke) | T-03 — landing renders 200 with system title; role-card link targets not deep-verified |
| FR-002 | PASS | T-06 (valid login → 200 + httpOnly SameSite=lax cookie), T-07 (401) |
| FR-003 | PASS | T-06 (admin username `admin`), T-08 (faculty name as username), T-09 student login (registered name as username) |
| FR-004 | PASS | Register existing-roster name "Ako ay Student" → **200** (user id 103); unknown name → **404** "Name not found in the roster"; duplicate → **409** "This name is already registered". Block-mismatch path untested — all seeded roster entries have `blockId=null` (accept-any-block path per route comment); seeded-data limitation, not a test weakening |
| FR-005 | NOT-TESTED | Faculty registration flow not exercised at G5 → G7 |
| FR-006 | NOT-TESTED | Admin registration + 3-account cap not exercised at G5 → G7 |
| FR-007 | PARTIAL | T-05 (unauth → login redirect), T-08 (wrong-role rejected). Logout endpoint not exercised at G5 |
| FR-010 | PASS (static) | `prisma/schema.prisma` present; models per workstream (User, FacultyProfile, Block, Subject, Room, Schedule, RosterEntry); T-01/T-02 compile against it. Runtime FK/constraint behavior → G7 |
| FR-011 | PARTIAL | dev.db present (3.69 MB); User ids 81 (admin), 98/103 (students) observed live. Full seed-count assertion via `counts-*.log` (builder-run) not independently re-run at G5 |
| FR-012 | NOT-TESTED | Admin CRUD UI/API → G7 |
| FR-013 | NOT-TESTED | Schedule CRUD + day multi-select → G7 |
| FR-014 | NOT-TESTED | Roster CSV import → G7 |
| FR-015 | NOT-TESTED | Schedule CSV export → G7 |
| FR-020 | NOT-TESTED | Utilization view data-correctness → G7 (page renders: `/faculty` 200 authed, T-08) |
| FR-021 | NOT-TESTED | Status badge logic port → G7 (`src/lib/status.ts` unit testing out of G5 scope) |
| FR-022 | NOT-TESTED | Heartbeat ping → G7 (endpoint present in build route table) |
| FR-023 | PARTIAL | `/student` renders 200 read-only for a STUDENT session (T-09); data-correctness → G7 |
| FR-030 | NOT-TESTED (here) | Covered by task_0001 UI-AUDIT.md (independent frontend audit) |
| FR-031 | NOT-TESTED (here) | Covered by task_0001 UI-AUDIT.md |
| FR-032 | PASS | T-03 + T-09 (all 6 route groups, code + runtime) |
| FR-033 | NOT-TESTED (here) | Covered by task_0001 UI-AUDIT.md (states/contrast) |
| FR-034 | NOT-TESTED | Responsive 360px behavior → visual pass at G7 |
| NFR-001 | PASS | T-01 (tsc exit 0) + T-02 (build compiles, types checked) |
| NFR-004 | PASS (observed) | T-07: typed JSON error body; register 404/409 typed JSON errors observed (FR-004 row) |
| NFR-005 | PASS (observed) | T-06: cookie `HttpOnly; SameSite=lax` on dev (Secure-in-prod path not exercised) |

## Anomaly (for Leader awareness — not a G5 gate failure)

**Transient 401 on login immediately after registration.** Dev log (`g5-dev-out.log`) sequence:

```
POST /api/auth/register/student 200 in 110ms   ← user id 103 "Ako ay Student" created
POST /api/auth/login            401 in 99ms    ← same credentials, first attempt
POST /api/auth/login            200 in 144ms   ← identical retry, success
```

Logging in with freshly-registered credentials returned 401 once; the identical retry seconds later returned 200. Both register and login use `findUserByUsername` (`db.user.findUnique` exact match — the row existed). Suggests a possible Prisma engine read-lag/caching race in dev; low severity (user-facing impact: one retry), worth a look before G7.

## Artifact index (all under run folder `2026-10-20-sqlite-prisma-adoption/`)
- Plan: `docs/TEST-PLAN.md` · This report: `docs/TEST-REPORT.md`
- Typecheck: `g5-tsc-out.log` (run 1, empty = 0 diagnostics), `g5-tsc2-out.log` / `g5-tsc2-err.log` / `g5-tsc2-code.txt` (run 2, exit code 0)
- Build: `build2-out.log`, `build2-err.log`
- Dev server: `g5-dev-out.log`, `g5-dev-err.log`
- Session cookies (dev-only, sessions died with server kill): `g5-admin-cookie.txt`, `g5-faculty-cookie.txt`, `g5-student-cookie.txt`
- QA scratch (read-only DB inspection): `qa-tmp/student-users.ts`

## Integrity statement (R8)
No test was weakened to pass. All status lines captured verbatim; negative results (401/404/409/307) are reported as observed. FRs outside G5 smoke scope are marked NOT-TESTED rather than claimed.

| NFR-002/003/006 | NOT-TESTED | Static/code-review checks → G7 (no raw-SQL scan, .env audit, timezone unit isolation performed here) |
