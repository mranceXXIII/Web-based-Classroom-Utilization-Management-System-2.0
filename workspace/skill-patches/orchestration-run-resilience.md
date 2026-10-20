# Skill Patch — orchestration-run-resilience

- **Target:** dev-team orchestration (Team Leader) · `reference/orchestration-tools.md` §Await / Failure handling
- **Origin:** run 2026-10-14-sqlite-prisma-ui-unification, E2 + E8
- **Status:** Proposed (authored by Leader; apply to the orchestration reference)

## Problem

Long agent runs die on transient infrastructure errors ("Too Many Requests", "Response stream ended without a finish reason"). Two Leader-side failure modes amplify the damage:

1. Awaiting with no `runId` re-evaluates previously FAILED historical runs and returns their error, masking the status of the live runs the Leader actually cares about.
2. A dead run that was mid-workstream looks indistinguishable from a run that never started, unless durable artifacts exist.

## Rule (new)

- **R-ORCH-1 — Await specific runs.** During multi-run sessions, always `team_await_runs` with an explicit `runId` (the newest one). Never rely on the no-arg form once any run in the session has failed.
- **R-ORCH-2 — Size runs to the checkpoint, not to the deliverable.** Plan each workstream so its critical path is ≤ ~30 minutes; if longer, split into sequential runs with a durable artifact boundary between them.
- **R-ORCH-3 — Continuation, not restart.** After a run failure, inspect on-disk artifacts + progress log FIRST, then dispatch a CONTINUATION brief that names exactly what exists and what remains; forbid re-doing completed work. Verify on-disk state before continuing (the frontend continuation proved zero work lost this way).
- **R-ORCH-4 — Classify failures.** Distinguish infrastructure failure (re-dispatch continuation) from task failure (fix the brief or the agent's approach). Both must land in the retrospective ledger regardless.
- **R-ORCH-5 — Budget the meta-calls.** High-frequency polling of run status in a long session can itself trigger rate limits. Poll at meaningful intervals and prefer awaiting explicit run ids over repeated full listings.

## Evidence this run

- `run_00002` (frontend) failed after 43 min → `run_00003` continuation finished in 22 iterations, 0 work lost.
- `run_00007` (QA) failed after 41 min → `run_00009` continuation resumed from `docs/TEST-PLAN.md`.
- No-arg await returned `run_00002:failed` while `run_00003/4/5` were the live runs.
