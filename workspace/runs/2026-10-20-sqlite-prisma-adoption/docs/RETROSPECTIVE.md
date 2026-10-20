# RETROSPECTIVE — Run 2026-10-20-sqlite-prisma-adoption

_Owner: Team Leader · Phase 8 (mandatory) · Short-run addendum to the 2026-10-14 retrospective._

## 1. Error ledger

| # | Event | Class | Recurrence risk | Patch |
| :-- | :--- | :--- | :--- | :--- |
| E1 | Root `tsconfig.json` `include: ["**/*.ts"]` swept the whole repo (previous run's code copy + qa-tmp scratch `.ts` files) → `next build` stalled in type-checking, then failed on a scratch file. Caught by the frontend agent's escalation; fixed by Leader (scoped include/exclude); build2 passed. | Process (adoption gap) | **Systemic — any adoption into a repo with foreign TS trees** | `workspace/skill-patches/adoption-tsconfig-scope.md` (R-ADO-1..3) |
| E2 | `taskkill` error text on stderr aborted the remainder of a PowerShell pipeline → build2 was silently never launched; detected because the log file did not exist. | Platform pitfall (variant of R-WIN-4) | Recurring on Windows | Covered by existing `windows-node-toolchain-pitfalls.md`; addendum noted: check artifact existence after pipelines containing native stderr, do not trust the absence of error text. |

## 2. What went well (keep)

- **Inherited frozen contracts made this run short**: no schema, API, or type decisions were re-litigated; both workstreams ran against the 2026-10-14 baseline.
- **Skill patches worked as designed**: the frontend agent applied R-FE-CHK checkpoint discipline from minute 0 (progress log was a working resume contract), R-CTR-4 whole-project verification caught the tsconfig exposure, and the escalation loop Leader→fix→re-verify completed in one cycle.
- **QA separation held**: QA re-ran typecheck independently (exit code captured), exercised live auth/guard/cookie flows, killed the dev server with verification, and disclosed DB mutations (user id 103 created for role-guard testing).

## 3. Open items (non-blocking)

- Transient dev-mode 401 on first login immediately after registration (TEST-REPORT §Anomaly) — investigate Prisma engine read-lag before production cutover.
- `npm audit` reports advisories in transitive dev-tooling; review before production.
- Install-scripts allowScripts policy blocks Prisma/esbuild postinstall on this host — `prisma generate` must be run explicitly after fresh installs (recorded in ADOPTION-RECORD.md).

## 4. Patches applied

| Patch | Target | Applied |
| :--- | :--- | :--- |
| `adoption-tsconfig-scope.md` | all agents (Leader handoff + builders) | Authored this run; applied live (tsconfig fixed, build proven) |
| `windows-node-toolchain-pitfalls.md` (existing) | all agents | Re-exercised all run long (G:\npm.cmd, background+polling, artifact-existence checks) |
