# LEGAL-COMPLIANCE-REVIEW — Run 2026-10-20-sqlite-prisma-adoption (G6)

**Verdict: INHERITED — CLEAR-WITH-CONDITIONS (unchanged).**

## Basis

This run changed **no dependency**: `package.json` at the project root is byte-identical
in its dependency sections to the audited `workspace/runs/2026-10-14-sqlite-prisma-ui-unification/code/package.json`
(verified during adoption copy). Therefore the full evidence-backed audits of the
2026-10-14 run remain authoritative and are adopted without modification:

- `workspace/runs/2026-10-14-sqlite-prisma-ui-unification/docs/LICENSE-AUDIT.md`
  — 85 top-level + 3 nested packages, all permissive families (MIT ×61, Apache-2.0 ×12,
  ISC ×4, BSD ×3, 0BSD, CC-BY-4.0, MPL-2.0 ×2, one optional app-unused
  Apache-2.0/LGPL-3.0 dual-licensed sharp binary). No GPL/AGPL/SSPL/unknown licenses.
- `workspace/runs/2026-10-14-sqlite-prisma-ui-unification/docs/LEGAL-COMPLIANCE-REVIEW.md`
  — privacy/data-protection (no personal-data exfiltration; student names + presence
  timestamps stored locally in SQLite), IP/attribution, conditions list (§5).

## Conditions carried forward (unchanged)

1. Ship `THIRD-PARTY-NOTICES.md` (already copied to the project root this run) before
   any distribution or production cutover.
2. Keep attribution obligations: caniuse-lite (CC-BY-4.0), Apache-2.0 NOTICE for
   @prisma/client, bcryptjs BSD-3 copyright lines.
3. `.env` AUTH_SECRET is a secret: it is excluded from version control by the root
   `.gitignore` created in this run; rotate before production.

## Delta check performed this run

- Root `node_modules` was freshly installed 2026-10-20 from the same lockfile-pinned
  ranges; `npm ls` output in npm-install-out.log shows the same major/minor line
  (Next 15.5, Prisma client 6.19.3, React 19). No new direct dependency was added.
