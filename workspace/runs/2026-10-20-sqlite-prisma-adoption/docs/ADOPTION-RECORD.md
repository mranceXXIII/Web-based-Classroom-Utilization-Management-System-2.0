# ADOPTION RECORD — 2026-10-20

_What moved from `workspace/runs/2026-10-14-sqlite-prisma-ui-unification/code/` to the project root, and what changed._

## Copied to project root (unchanged content)

- `src/` (69 files: pages, components, lib) — then polished by the frontend workstream (see UI-AUDIT.md)
- `prisma/` — `schema.prisma`, `seed.ts`, `migrations/`, seeded `dev.db`
- `package.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `.env`, `.env.example`
- `README-SECURITY.md`, `THIRD-PARTY-NOTICES.md`

## Created / modified at project root

| File | Change | Why |
| :--- | :--- | :--- |
| `.gitignore` | NEW | Excludes `node_modules/`, `.next/`, `.env`, `*.db`, logs — keeps AUTH_SECRET and DB out of git. |
| `tsconfig.json` | MODIFIED | `include` narrowed from `**/*.ts(x)` (whole repo) to `src/**`, `prisma/**`, `.next/types/**`; `exclude` now also `workspace`, `.kilo`, `.next`. The broad include swept the 2026-10-14 run's code copy and `qa-tmp` TypeScript scratch files, breaking `next build` type-checking. |

## NOT modified (legacy reference, untouched)

All legacy PHP sources (`*.php`, `Admin/`, `Faculty/`, `Students/`), SQL dumps
(`db/educ_room_utilization.sql`, `u129841553_educ_room_util.sql`), `context/` docs,
`config.php` files.

## Verification at root (2026-10-20)

- `G:\npm.cmd install` — completed (npm-install-out.log); 4 install-scripts blocked by allowScripts policy → handled by explicit `G:\npx.cmd prisma generate` (prisma-gen-out.log: Prisma Client v6.19.3 generated).
- DB integrity: counts.ts → `{"users":20,"faculty":18,"blocks":8,"subjects":28,"rooms":13,"schedules":36,"roster":6}` (seeded; +3 users/+1 faculty vs pristine seed — created by the 2026-10-14 run's live QA/pentest smoke accounts).
- Production build (`build2-out.log`): compiled successfully, full route table (/, /login/[role], /register/[role], /admin + 6 sections, /faculty, /student, 12 API routes, middleware).
- Frontend: `tsc --noEmit` 0 errors; UI uniformity audit passed (UI-AUDIT.md).
