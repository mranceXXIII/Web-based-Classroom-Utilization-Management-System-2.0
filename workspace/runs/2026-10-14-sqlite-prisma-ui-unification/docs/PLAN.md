# PLAN — Execution Order & Workstreams

_Run: 2026-10-14-sqlite-prisma-ui-unification · Owner: Team Leader_

## Gates
- **G1** Charter pack approved → Leader (DONE at authoring).
- **G2** Plan + contract pack (PLAN, API-CONTRACT, DATA-MODEL, UI-SPEC) → Leader approves before fleet build.
- **G3** Stack freeze (TECH-STACK.md) → Leader.
- **G4** Leader scaffolds base app so agents never scaffold concurrently.
- **G5** QA TEST-REPORT all FR traceable + Pentest SECURITY-ASSESSMENT with CVSS findings fixed.
- **G6** Legal LICENSE-AUDIT clean.
- **G7** Leader approval recorded in APPROVALS.md.

## Step Order
1. **Leader:** scaffold Next.js base (package.json pinned deps, tsconfig, Tailwind, Prisma init, folder skeleton, `.gitignore`, `.env.example`, placeholder design tokens). Verify `npm install` + build pass.
2. **Spawn async (parallel):** `backend` and `frontend` (task board: one task each, they claim & complete with artifact links).
3. **Backend workstream:** prisma schema + seed + migrate → lib (db/auth/status/semester/types) → middleware → API routes (auth, crud, heartbeat, export/import) → `API-CONTRACT.md` + `DATA-MODEL.md` → PROGRESS-LOG.md.
4. **Frontend workstream:** **MUST first read the 8 design-engineering files listed in its briefing** → tokens + theme toggle → app shell (header/nav/footer) → landing/login/register → admin CRUD UI → faculty/student utilization views + badges → `UI-SPEC.md` → PROGRESS-LOG.md.
5. **Leader:** integration pass — wire pages to real API responses, resolve interface mismatches.
6. **Spawn (parallel):** `qa`, `pentest`, `legal`. QA builds TEST-PLAN → executes → TEST-REPORT (FR traceability). Pentest: THREAT-MODEL → SECURITY-ASSESSMENT (CVSS). Legal: dependency license audit.
7. **Fix loop:** builders fix confirmed defects; QA/pentest re-verify (they never fix).
8. **G7:** Leader verdicts → APPROVALS.md → `team_create_outcome`/`team_finalize_outcome`.
9. **Retrospective:** skill patches for every error encountered (mandatory, R6/R8).

## Interface Contract (frozen at G2)

- Auth cookie name: `rsu_session` (JWT HS256, payload `{sub, role, name}`).
- API envelope: success `{ data }`; error `{ error: string, fields?: Record<string,string> }`.
- Entities under `/api/crud/`: `faculty`, `blocks`, `subjects`, `rooms`, `schedules`, `roster` — verbs `GET` (list), `POST` (create), `PUT` (update, body.id), `DELETE` (?id=).
- `/api/auth/login|logout|register/student|register/faculty|register/admin`.
- `/api/heartbeat` (GET, faculty only) → `{ data: { lastHeartbeat } }`.
- `/api/export/schedules` → `text/csv`. `/api/import/roster` (multipart CSV).
- Theme contract: `<html class="dark|light">` toggled by `src/components/theme-toggle.tsx`; tokens in `src/app/globals.css` custom properties.

## Agent Briefings
Each agent receives: its role prompt, this PLAN, ARCHITECTURE, REQUIREMENTS, TECH-STACK, EXISTING-PROJECT-ANALYSIS, run folder path, file-ownership boundary, integrity rules (R1–R8), and the evidence rule (R3).
