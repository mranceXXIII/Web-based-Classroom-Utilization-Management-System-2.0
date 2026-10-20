# Skill Patch — adoption-tsconfig-scope

- **Target:** all agents performing app adoption/integration into an existing repository root (Leader + backend + frontend) · `reference/handoff-protocol.md` §Integration
- **Origin:** run 2026-10-20-sqlite-prisma-adoption, E1
- **Status:** Proven live (patch applied mid-run; build passed after fix)

## Problem

When the completed app was adopted into a repo root that contains other code trees
(here: a previous run's code copy plus `qa-tmp` TypeScript scratch files under
`workspace/`), the app's `tsconfig.json` `include: ["**/*.ts", "**/*.tsx"]` swept the
ENTIRE repository. Result: `next build` hung in "Linting and checking validity of
types" for minutes and then failed on a scratch file that was never part of the app.
A green `tsc --noEmit` in the source-only context masked it.

## Rules (new)

- **R-ADO-1 — Scope tsconfig to the app's own source.** On adoption, rewrite `include`
  to explicit app paths (`src/**`, `prisma/**`, `.next/types/**`, `next-env.d.ts`) and
  add all foreign trees to `exclude` (e.g. `workspace`, archive folders, scratch dirs).
  Verify by running the full build from the adopted root, not just `tsc`.
- **R-ADO-2 — Scratch TypeScript files must live outside the compiled root, or carry a
  non-compiled extension.** QA/diagnostic scripts belong in a folder excluded by the
  tsconfig (or `.ts.txt`/`.bak`). Never leave `.ts` scratch files where a broad
  `include` can find them.
- **R-ADO-3 — The adoption gate is a full `next build` (or equivalent) at the adopted
  root.** Typecheck alone is insufficient (R-CTR-4 applied to adoption).

## Evidence this run

- Frontend agent escalated the issue during task_0001; build1 died on a `qa-tmp`
  scratch file (`manilaInstant`); after the Leader narrowed `include`/`exclude`,
  build2 compiled successfully with the full route table.
