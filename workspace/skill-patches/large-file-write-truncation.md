# Skill Patch — large-file-write-truncation

- **Target:** all builder agents · `reference/standards.md` §Output discipline
- **Origin:** run 2026-10-14-sqlite-prisma-ui-unification, E3
- **Status:** Proposed (authored by Leader; cost 4 seed attempts this run)

## Problem

`prisma/seed.ts` (~300 lines) was written in single large editor operations and was **silently truncated** three times, each time with a different symptom:
1. Cut mid-type-definition → `esbuild Transform failed: seed.ts:33:33: Unexpected "="`
2. An insert landed inside an array literal, dropping its closing bracket → `Expected "]" but found "SchedSeed"`
3. Stale duplicate fragments left at EOF → `Unexpected "]"` at line 287

Each truncation surfaced only when the seed ran, costing a full diagnose-fix-rerun cycle.

## Rules (new)

- **R-WRITE-1 — Cap single-write payloads (~150 lines / ~6000 chars).** Build large files in ordered chunks: create the file with the first chunk, then append subsequent chunks with anchored edits.
- **R-WRITE-2 — Verify the tail after every large write.** Read the last few lines back and confirm the expected closing construct exists. A silent truncation is invisible in the edit tool's success message.
- **R-WRITE-3 — Parse early, parse often.** For code files, run the cheapest syntax check available the moment the file is structurally complete (`tsc --noEmit`, `esbuild`, `node --check`, `php -l`). Do not wait for the full pipeline.
- **R-WRITE-4 — Distrust "already written" assumptions after a crash.** Re-read the tail of any file that was being written when a run died; partial writes are the norm, not the exception.
- **R-WRITE-5 — One logical construct per chunk.** Never split a type definition, array literal, or JSX block across an ambiguous boundary; end each chunk at a natural closing brace/bracket.

## Evidence this run

- Three consecutive `seed.ts` truncations produced esbuild errors at lines 33, 118, 287 before the fourth attempt succeeded with all counts verified (17/17/8/28/13/36/6).
