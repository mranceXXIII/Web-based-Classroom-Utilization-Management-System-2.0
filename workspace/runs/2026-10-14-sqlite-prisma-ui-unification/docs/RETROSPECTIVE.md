# RETROSPECTIVE — Run 2026-10-14-sqlite-prisma-ui-unification

_Owner: Team Leader · Phase 8 (mandatory) · Every error below produced a skill patch in `workspace/skill-patches/`._

## 1. Error ledger (classification)

| # | Event | Class | Recurrence risk | Patch |
| :-- | :--- | :--- | :--- | :--- |
| E1 | Frontend run `run_00002` died mid-workstream: "Response stream ended without a finish reason" (~43 min in). Partial work survived only because the agent happened to write files as it went. | Infrastructure + process | **Systemic** — any long agent run can die this way | `frontend-checkpoint-resilience.md`, `orchestration-run-resilience.md` |
| E2 | QA run `run_00007` died with "Too Many Requests" (~41 min in) after authoring TEST-PLAN but before TEST-REPORT. Resume possible only because TEST-PLAN was written as a separate durable artifact. | Infrastructure + process | **Systemic** | `orchestration-run-resilience.md` |
| E3 | Backend seed.ts was silently TRUNCATED by three consecutive large single-file writes (esbuild parse errors at line 33, 118, 287); four seed attempts consumed. | Tooling hazard | **Preventable, systemic** | `large-file-write-truncation.md` |
| E4 | `Set-Content -Encoding UTF8` (Windows PowerShell 5.1) injected a BOM → npm refused to parse `package.json` ("Unexpected token '﻿'"). | Platform pitfall | **Preventable, recurring on Windows** | `windows-node-toolchain-pitfalls.md` |
| E5 | npm unusable from PATH (`npm.ps1` blocked by execution policy; `Get-Command npm.cmd` resolved to malformed `G:npm.cmd`) → all npm work must use `G:\npm.cmd`. | Platform pitfall | **Recurring on this host/any Windows host** | `windows-node-toolchain-pitfalls.md` |
| E6 | Frontend imported shared types (`DayCode`, `Role`, `Semester`, DTOs) from its own `@/components/mocks` mirror instead of the frozen canonical `@/lib/types` → 20 type errors, caught by backend's build, fixed in continuation. | Process (contract drift) | **Preventable, systemic** | `cross-agent-type-contract-drift.md` |
| E7 | PowerShell false `NativeCommandError` when piping native-command stderr (`2>&1 \| Select-Object`) → wasted diagnosis cycles. | Platform pitfall | **Recurring on Windows** | `windows-node-toolchain-pitfalls.md` |
| E8 | `team_await_runs` (no runId) retried an already-failed historical run, masking the live runs' status. | Orchestration tooling | **Recurring in long multi-run sessions** | `orchestration-run-resilience.md` |
| E9 | Long-running npm/next/prisma commands always exceed the 30s tool timeout. | Platform pitfall | **Recurring** | `windows-node-toolchain-pitfalls.md` |

## 2. What the team did well (keep)

- **Frozen contracts worked**: INTERFACE-TYPES.md + PLAN.md interface contract made backend and frontend independently buildable; the only cross-boundary defect (E6) was precisely detectable and cheap to fix.
- **Incremental durable artifacts saved two dead runs**: because frontend wrote files + Progress Log as it went, the continuation (run_00003, 22 iterations) finished with **zero work lost**; QA's separately-authored TEST-PLAN made its continuation possible.
- **Evidence discipline (R3) held**: backend 27/27 logic harness + live API smoke; pentest reproduced every finding live with commands; legal cited an installed file for every license claim.
- **Builder/verifier separation (R4) held**: pentest and QA never edited code; fixes were routed back to backend and re-verified (run_00008 confirmed all 7 fixes on the wire).
- **Legacy fidelity**: statusFunc port is legacy-exact including the dead `minutes<=60` branch — QA's expectations were corrected, not the code (good direction of fix).

## 3. Systemic weaknesses to close

1. **Checkpoint cadence** — agents must persist durable artifacts (files + progress log entries) at least every ~15 minutes of work, never at the end. (E1/E2)
2. **Write-size discipline** — never author a >150-line file in a single write; chunk it and verify the tail + parse. (E3)
3. **Canonical-type rule** — shared types live in ONE module; mirrors are banned even temporarily. (E6)
4. **Run sizing** — split workstreams so a single run's critical path is ≤ ~30 min where possible. (E2/E8)

## 4. Patches applied / to apply

| Patch file | Target skill/agent | Application point |
| :--- | :--- | :--- |
| `frontend-checkpoint-resilience.md` | frontend agent role; design-engineering lifecycle | frontend role prompt "OPERATING DISCIPLINE" section |
| `orchestration-run-resilience.md` | Team Leader (dev-team orchestration) | `reference/orchestration-tools.md` §Await/Failure handling |
| `large-file-write-truncation.md` | all builder agents | builder role prompt "OUTPUT DISCIPLINE" + `reference/standards.md` |
| `windows-node-toolchain-pitfalls.md` | all agents on Windows hosts | `reference/standards.md` §Environment pitfalls; agent-spec shared rules |
| `cross-agent-type-contract-drift.md` | frontend + backend + Leader | `reference/handoff-protocol.md` §Shared contracts |

**Re-run to prove the fix:** E6's rule was exercised immediately — the frontend continuation imported from `@/lib/types` only, and `tsc --noEmit` returned 0 errors with a passing `next build`. E1/E2's rule was exercised by both continuations (run_00003, run_00009) resuming with zero lost work.
