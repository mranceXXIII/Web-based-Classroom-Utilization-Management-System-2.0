# REQUIREMENTS — Numbered, Testable

_Run: 2026-10-14-sqlite-prisma-ui-unification · Owner: Team Leader_

## Functional Requirements

### Landing & Auth
- **FR-001:** `/` renders a minimalist role-selection landing (Admin, Faculty, Student) linking to each role's login.
- **FR-002:** Each role has a login page posting to `/api/auth/login`; credentials verified against `User` (bcrypt); on success an httpOnly session cookie is set and the user is redirected to their role dashboard.
- **FR-003:** Faculty login username = faculty name; Student login username = registered name; Admin login username = `admin_register`-equivalent admin user.
- **FR-004:** Student registration (`/api/auth/register/student`) succeeds **only** when the name exists in `RosterEntry` and the chosen block matches; otherwise a clear error is shown.
- **FR-005:** Faculty registration activates a password only when the faculty row exists and has no user account yet.
- **FR-006:** Admin registration requires the name to exist in faculty records and enforces a maximum of **3** admin accounts.
- **FR-007:** Logout destroys the session server-side and clears the cookie; every protected route redirects unauthenticated visitors to the correct login; role mismatches are rejected (Admin pages deny Faculty/Student, etc.).

### Data & Admin Management
- **FR-010:** Prisma schema (SQLite) models: `User`, `FacultyProfile`, `Block`, `Subject`, `Room`, `Schedule`, `RosterEntry` with enforced foreign keys and unique constraints (per `ARCHITECTURE.md` §3).
- **FR-011:** Seed script populates verified legacy data: 7 blocks, 6 roster entries, 13 rooms, faculty list, subjects, sample schedules, 1 admin user.
- **FR-012:** Admin can CRUD faculty (name, academic rank, advisory), blocks, subjects, rooms via the UI.
- **FR-013:** Admin can CRUD schedules: block, subject, room, faculty, semester, start/end time, and selected days (Mon–Sun multi-select replacing legacy per-day color columns).
- **FR-014:** Admin can import a student roster CSV (name, block) into `RosterEntry` and see the roster list.
- **FR-015:** Admin can export the schedule list as CSV.

### Utilization Views & Presence
- **FR-020:** Faculty dashboard renders the weekly room utilization view: one table per room with schedules for the **current semester** (via `getQuarter()` mapping: months 8–12 → `1st Sem`, 1–5 → `2nd Sem`, else `Vacation`).
- **FR-021:** Status badge logic ported exactly (Asia/Manila): heartbeat gap > 1 day → red `Vacant N day(s)`; heartbeat gap ≤ 15h → red `Unavailable X min/hr(s)`; current time within start/end → green `Active`; outside → blue `Inactive`; no faculty → `No Faculty`.
- **FR-022:** Faculty heartbeat: logged-in faculty pings `/api/heartbeat` every 60s, updating `FacultyProfile.lastHeartbeat`.
- **FR-023:** Student dashboard shows the same utilization view read-only (no heartbeat).

### UI / Design System (user-mandated)
- **FR-030:** One uniform design language on every page: single token set (colors, spacing, radii, typography), consistent component shapes for buttons, inputs, tables, cards, badges.
- **FR-031:** Minimalist aesthetic: generous whitespace, restrained palette, no decorative gradients/watermarks/tickers from legacy, no Bootstrap/jQuery/vendored assets.
- **FR-032:** Dark/light theme toggle in the app header on every page; persists across reloads (localStorage); defaults to system preference; no flash of wrong theme (pre-hydration script).
- **FR-033:** All interactive states (hover/focus/disabled/error) defined for both themes; contrast meets WCAG AA for body text.
- **FR-034:** Responsive down to 360px width; tables scroll horizontally rather than breaking layout.

## Non-Functional Requirements
- **NFR-001:** `npm run build` completes with 0 TypeScript errors.
- **NFR-002:** No raw SQL string interpolation anywhere; all data access via Prisma Client.
- **NFR-003:** Secrets only via `.env` (gitignored); `.env.example` documents every variable; no hardcoded credentials.
- **NFR-004:** All mutations validate input server-side (zod) and return typed JSON errors.
- **NFR-005:** Passwords hashed with bcryptjs (cost ≥ 10); session cookie httpOnly + SameSite=Lax + Secure in production.
- **NFR-006:** Timezone-sensitive logic unit-testable and isolated in `src/lib/status.ts` / `src/lib/semester.ts`.

## Traceability
QA must map every FR-### to at least one test id in `TEST-REPORT.md`. NFRs verified at gates G5/G7.
