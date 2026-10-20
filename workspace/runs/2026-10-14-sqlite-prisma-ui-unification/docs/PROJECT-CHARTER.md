# PROJECT-CHARTER — SQLite + Prisma + UI Unification Rebuild

_Run: 2026-10-14-sqlite-prisma-ui-unification · Owner: Team Leader · Status: APPROVED (Leader)_

## 1. Goal

Rebuild the Classroom Utilization Management System (RSU Cajidiocan, Education Dept.) as a **single modern full-stack app**: **Next.js App Router + TypeScript + Prisma + SQLite**, with a **uniform, clean, minimalist UI** featuring a **dark/light theme toggle**. Preserve all domain behavior (roles, schedules, presence heartbeat, status badges, roster gating, CSV export/import) while eliminating every legacy security defect.

## 2. Scope

**In scope**
- New Next.js app in `workspace/runs/<run>/code/` (this is the 2.0 deliverable).
- Prisma schema for SQLite modeling the 8 legacy tables (normalized, FK-enforced), plus a seed script carrying verified legacy data forward.
- Auth (login/register for Admin/Faculty/Student), session guards on every protected route, proper logout.
- Admin management surfaces: faculty, blocks, subjects, rooms, schedules, roster (+ CSV roster import, CSV schedule export).
- Faculty & Student utilization views with ported `statusFunc()` and `getQuarter()` semantics; faculty heartbeat.
- Minimalist design system: one token set, consistent typography/spacing, dark + light themes, persisted toggle.
- Tests, threat model, license audit, progress logs, all gate documents.

**Out of scope**
- Modifying/running any legacy PHP file; MySQL/MariaDB support; multi-database support; email/notifications; mobile apps; deployment infrastructure beyond a working local dev server.

## 3. Success Criteria

1. `npm run build` passes with zero TypeScript errors; `npm run dev` serves the app.
2. SQLite file DB via Prisma; `prisma db seed` populates verified legacy data; no MySQL references remain in new code.
3. All FR-### requirements in `REQUIREMENTS.md` demonstrably pass (QA TEST-REPORT with traceability).
4. UI: single uniform design language across every page; dark/light toggle works, persists, respects system preference; no legacy Bootstrap/jQuery/vendored assets.
5. No SQLi paths (Prisma parametrization), session guards verified, logout destroys session, no secrets committed (`.env` gitignored, `.env.example` provided).
6. Every gate (G1–G7) has an approval record in `APPROVALS.md`.

## 4. Constraints

- Windows host; Node v24.20.0; npm at `G:\npm.cmd` (PATH is broken — always use full path).
- SQLite is file-based: no `ALTER`-heavy iteration churn; schema decided once in review, then `prisma migrate dev`.
- Prisma requires Node: **PHP cannot talk to Prisma** — backend rebuild is mandatory (per EXISTING-PROJECT-ANALYSIS §6).
- bcrypt hashes: use `bcryptjs` (pure JS; verifies legacy `$2y$` hashes; no native build risk on Windows).
- Timezone logic pinned to `Asia/Manila` exactly as legacy.

## 5. Risks

| Risk | Mitigation |
| :--- | :--- |
| create-next-app/network flakiness on Windows | Leader scaffolds once; agents build inside it |
| Two agents editing same files | Strict file-ownership boundary in PLAN.md (backend: `prisma/`, `src/lib`, `src/app/api`; frontend: `src/app/(pages)`, `src/components`) |
| Status-logic drift from legacy semantics | Ported unit logic isolated in `src/lib/status.ts` + QA test cases copied from legacy rules |
| Tailwind v4 tooling differences | Pin exact versions in package.json; QA verifies build |
| Agent misses design-engineering skill | Frontend briefing **requires** reading the 8 listed reference files before writing code (user mandate) |

## 6. Non-Goals Recap

No PHP fixes, no MySQL, no real-time websockets (polling heartbeat is fine), no file uploads beyond CSV roster import, no email verification.
