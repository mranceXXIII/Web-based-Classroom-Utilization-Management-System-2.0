# Skill Patch — cross-agent-type-contract-drift

- **Target:** frontend + backend agents, and the Leader's handoff protocol · `reference/handoff-protocol.md` §Shared contracts
- **Origin:** run 2026-10-14-sqlite-prisma-ui-unification, E6
- **Status:** Proposed (authored by Leader; defect found and closed live)

## Problem

Backend and frontend ran in parallel. The frozen contract lived in `docs/INTERFACE-TYPES.md` with the implementation owned by backend (`src/lib/types.ts`). Because backend's file did not exist yet when frontend started, frontend created a **local mirror** of the shapes inside `@/components/mocks` and imported from there. Result: 20 type errors at integration (`DayCode`, `Role`, `Semester`, DTOs imported from the wrong module; `buildUtilizationView`/`UtilizationTable` missing), which blocked the first production build. Only the frozen doc + backend's build caught it — not the frontend's own typecheck (its mirrors were internally consistent).

## Rules (new)

- **R-CTR-1 — One canonical module per contract.** The Leader designates the canonical file (path + owner) in the frozen interface doc. Every consumer imports from that path. Local mirrors, re-declarations, or "temporary" copies are banned.
- **R-CTR-2 — If the canonical module doesn't exist yet, stub it in the canonical path.** The contract's owner (backend) creates `src/lib/types.ts` as the FIRST deliverable — before schema, before routes — so parallel consumers have a real target.
- **R-CTR-3 — The Leader sequences the contract, not the agents.** At G2 (plan/contract gate) the Leader freezes: file path, exported names, wire formats (e.g. `days` as `DayCode[]` on the wire, comma-joined string in the DB). Ambiguity here becomes a build failure later.
- **R-CTR-4 — Verification must cross the boundary.** A green typecheck in isolation does not prove contract conformance. The integration gate must run the whole-project build (`next build` / `tsc --noEmit` at repo root) before a workstream can be accepted.
- **R-CTR-5 — Sentinels are part of the contract.** Document sentinel conventions (this run: `facultyId: 0` + `facultyName: "None"` for no-faculty schedules; `blockId: 0` + empty `blockName` for block-less roster entries) in the frozen doc so both sides agree without reading each other's code.

## Evidence this run

- Backend's final build gate: "all 20 errors are in frontend-owned files only", first error `src/app/admin/schedules/page.tsx: '@/components/mocks' has no exported member named 'DayCode'`.
- After the continuation switched every import to `@/lib/types`: `tsc --noEmit` 0 errors, `next build` compiled successfully.
