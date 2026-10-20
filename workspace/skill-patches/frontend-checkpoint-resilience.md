# Skill Patch — frontend-checkpoint-resilience

- **Target:** frontend agent role · design-engineering lifecycle discipline
- **Origin:** run 2026-10-14-sqlite-prisma-ui-unification, E1
- **Status:** Proposed (authored by Leader; proven in run_00003 continuation)

## Problem

The frontend workstream died 43 minutes in on a transient stream error. It survived only because it had been writing real files and a progress log as it went — a habit that was not mandated by the role. Had it been "plan fully, then write everything at the end", the entire run would have been lost.

## Rules (new)

- **R-FE-CHK-1 — Persist at least one artifact per ~15 minutes.** No long silent build phases. Write the file, append a progress-log line (what/why/evidence), continue.
- **R-FE-CHK-2 — The Progress Log is a resume contract, not a diary.** Each entry must let a fresh agent resume: paths touched, decisions taken, what remains. The frontend continuation used exactly this to finish with zero work lost.
- **R-FE-CHK-3 — Leave the tree typecheck-able at every checkpoint.** Prefer many small compilable steps over one large refactor; a checkpoint that doesn't typecheck cannot be verified after a crash.
- **R-FE-CHK-4 — Import shared types from the canonical module only.** Never create a local mirror to "unblock" parallel work (see `cross-agent-type-contract-drift.md`).
- **R-FE-CHK-5 — Mark integration seams explicitly.** When backend runs in parallel, isolate all data access behind one thin module and label planned swaps with TODO-integration comments so the Leader's integration pass is mechanical.

## Evidence this run

- `run_00002` failed mid-workstream; on-disk state allowed `run_00003` to resume, fix 20 type errors, integrate the live API, and complete `docs/UI-SPEC.md` + passing build in 22 iterations.
