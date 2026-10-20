# PROJECT CHARTER — Run 2026-10-20-sqlite-prisma-adoption

_Run owner: Team Leader (dev-team skill) · Date: 2026-10-20_

## Goal

Adopt the completed SQLite + Prisma application produced by run
`2026-10-14-sqlite-prisma-ui-unification` (currently living at
`workspace/runs/2026-10-14-sqlite-prisma-ui-unification/code/`) **into the project
root**, so that this repository itself is the Prisma + SQLite implementation of the
Classroom Utilization Management System, and finish the pending verification gates
(G5 QA, G6 legal record, G7 leader approval) from that run.

## Inherited baseline (verified on disk 2026-10-20)

- Full Next.js 15 + TypeScript + Tailwind v4 + Prisma 6 + SQLite app:
  `src/app` (root, login/[role], register/[role], admin 7 sections, faculty, student,
  12 API routes), `src/components`, `src/lib`, `prisma/schema.prisma`,
  `prisma/seed.ts`, `prisma/dev.db` (seeded, 3.6 MB), `node_modules` present.
- Frontend verified previously: `tsc --noEmit` 0 errors, `next build` success,
  UI-SPEC written. Token-based theme system with persisted dark/light toggle and
  pre-hydration no-flash script (`src/app/layout.tsx`, `src/components/theme-toggle.tsx`,
  `src/app/globals.css`).
- Pending from that run: APPROVALS G5/G6/G7 marked PENDING.

## Scope

1. **Adoption (Leader):** copy configs, `prisma/`, `src/`, `.env` to repo root;
   create root `.gitignore`; run `npm install` (G:\npm.cmd), `prisma generate`;
   verify DB schema/seed intact. Legacy PHP files, SQL dumps, and context docs are
   NOT modified — they remain as historical reference.
2. **Frontend workstream (frontend agent, updated skill):** uniformity audit of all
   pages/components against `globals.css` tokens in BOTH light and dark modes;
   minimalist consistency fixes only (no redesign); verify dark/light toggle on
   every route group. Skill patches R-FE-CHK-1..5, R-CTR-1..5, R-WIN-1..6 are
   binding.
3. **QA workstream (qa agent):** typecheck, production build, route smoke test
   against a running dev server, theme toggle behavior check, TEST-REPORT with
   FR traceability to inherited REQUIREMENTS.md.

## Non-goals

- No new features beyond the inherited REQUIREMENTS.md (FR-001..FR-034).
- No changes to legacy PHP sources, SQL dumps, or `context/` docs.
- No schema redesign (frozen DATA-MODEL.md from 2026-10-14 run).

## Success criteria

- `npm run build` passes at the **project root**; `npm run dev` serves the app.
- Frontend typecheck 0 errors; dark/light toggle verified on all route groups.
- QA TEST-REPORT issued with requirement traceability; APPROVALS updated through G7.

## Constraints & risks

- Windows host: all Node/npm per skill patch `windows-node-toolchain-pitfalls.md`
  (use `G:\npm.cmd`/`G:\npx.cmd`, background long commands with log polling).
- 30s tool timeouts on long commands — never block on install/build.
- `.env` AUTH_SECRET is a local dev secret; never committed (root `.gitignore`).
