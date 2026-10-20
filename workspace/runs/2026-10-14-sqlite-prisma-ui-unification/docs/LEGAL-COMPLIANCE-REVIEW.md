# LEGAL-COMPLIANCE-REVIEW — RSU Classroom Utilization 2.0

_Run: 2026-10-14-sqlite-prisma-ui-unification · Owner: Legal/Compliance Agent · Review date: 2026-10-14 · Primary framework: **Philippine Data Privacy Act of 2012 (RA 10173)** + IRR (2016) + NPC issuances; deploying institution: Romblon State University (state university, Cajidiocan Campus, Education Department)_

> **Status of this document:** technical compliance review prepared for the run team. It maps the system's data flows and dependencies onto RA 10173 obligations and proposes concrete controls. It is **not legal advice**; final legal sign-off rests with **RSU's Data Protection Officer (DPO)** per the institution's accountability obligations (RA 10173 IRR Rule VIII; NPC Advisory 2017-01).

## 1. License compatibility summary and verdict

Full evidence: `docs/LICENSE-AUDIT.md` (every claim cited to an installed `package.json` / `LICENSE` file). Findings:

- **17 direct dependencies** (8 runtime, 9 dev) and **85 transitive top-level packages + 3 nested duplicates**: all permissive (MIT/ISC/BSD/Apache-2.0/0BSD) except three flagged items — `caniuse-lite` (CC-BY-4.0, attribution only), `lightningcss` + native binary (MPL-2.0, file-level weak copyleft, build-time only), and `@img/sharp-win32-x64` (dual Apache-2.0 **AND** LGPL-3.0-or-later — optional image-optimization binary that this app never invokes: no `next/image`/`<Image>` usage and no `public/` directory, verified by grep of `code/src`).
- **No GPL/AGPL/SSPL and no unknown-license package anywhere in the tree.**
- **License verdict: CLEAR-WITH-CONDITIONS** — see §5 (the license-specific condition is C1, a third-party notices file).

## 2. Data protection (RA 10173) analysis

### 2.1 Personal data inventory (what the system actually stores)

| Data | Where (evidence) | Personal info? | Notes |
| :--- | :--- | :--- | :--- |
| Faculty full names as usernames + roles | `code/prisma/seed.ts` lines 39–56 (16 faculty: e.g. Gerardo Ribon, Clara Jean Juanzo, Angelica Rico, …); `docs/DATA-MODEL.md` §Seed (17 users) | Yes | Login is by faculty **name** (legacy semantics preserved) |
| bcrypt password hashes | `seed.ts` lines 41–44, 48, 51–52 — six legacy `$2y$10$…` hashes ported verbatim; others `bcrypt.hashSync(…, 10)`; `docs/DATA-MODEL.md` §User | Credentials (not §13 "sensitive personal info", but security-relevant) | Cost 10; legacy hashes are ~2023-vintage |
| Faculty academic rank, advisory assignment, presence heartbeat | `seed.ts` lines 40–56 (`academicRank`, `advisory`, `lastHeartbeat` as Asia/Manila instants, e.g. `2023-10-02T13:18:51+08:00`); `docs/DATA-MODEL.md` §FacultyProfile | Yes | Heartbeat = work-presence data; **all ported heartbeats are 2023** |
| Student roster names (+ block) | `seed.ts` lines 72–79 (6 real names, e.g. Mark Joshua Rance, Rogen Ramilo, …); `docs/DATA-MODEL.md` §RosterEntry | Yes | Registration gate (FR-004) matches against these names |
| Schedules (faculty × block × subject × room × time) | `seed.ts` lines 119–169 (36 rows); `docs/DATA-MODEL.md` §Schedule | Yes (indirectly — reveals who teaches where/when) | 2023 `1st Sem` data carried as fixture |
| Session cookie | `code/src/lib/session.ts` lines 69–77: `httpOnly`, `SameSite=Lax`, `secure` in production, `path=/`, 7-day max age; JWT HS256 payload `{sub, role, name}` (lines 28–35) | Yes (identifier only) | JWT is **signed, not encrypted** — payload is only sub/role/name (appropriate; nothing sensitive belongs in it) |
| `code/prisma/dev.db` | exists on disk (verified); `code/.gitignore` lines 7–8 ignore `*.db`, `*.db-journal` | Contains all of the above | Treat as a production-like data asset — see C4 |

No third-party/telemetry sinks exist for runtime data: `src/` contains **zero** `http(s)://` URL literals and **zero** `fs` writes (grep evidence, §4). localStorage holds only the theme preference (`src/app/layout.tsx:11`, `src/components/theme-toggle.tsx:24`) — not personal data.

### 2.2 Lawful basis

- RA 10173 §12 lawful-criteria fit: **§12(f)** — processing necessary for the fulfillment of RSU's functions as a public institution (room-utilization tracking is an internal academic-operations function); for faculty, also **§12(b)** (employment context). **Consent (§12(a)) should not be the primary basis** — roster gating means data is sourced from university records, and consent would be neither free nor specific for mandatory internal operations.
- The data involved (names, academic ranks, schedules, presence timestamps) is **ordinary personal information, not sensitive personal information under §13** (no health, religion, ethnicity, or similar), so §13's consent requirements do not attach. Password hashes are security credentials, not §13 data.
- **Action (C3):** document the §12(f)/§12(b) basis in RSU's privacy notice, displayed at login/registration. If any rostered student is a minor, apply heightened-care handling consistent with NPC guidance on minors' data.

### 2.3 Data minimization (RA 10173 §11(c) proportionality)

| Item | Seed carries (evidence) | Production recommendation |
| :--- | :--- | :--- |
| Users | 17 (1 `admin` + 16 faculty whose usernames are real full names) — `seed.ts`, `DATA-MODEL.md` §Seed | Create accounts only for **currently active** faculty; consider opaque usernames (employee number / institutional email local-part). Tradeoff: legacy login-by-name UX — decision for DPO + registrar (flagged) |
| Faculty profiles | academic rank + advisory + heartbeat | Rank/advisory are functionally needed for the utilization view — keep, current-semester only |
| Heartbeats | **2023 timestamps ported verbatim** (`DATA-MODEL.md` §Seed) | **Do not carry into production.** Seed with `lastHeartbeat = null` (functionally equivalent: badge shows `Vacant`) — C4 |
| Roster | 6 legacy names, block empty (`seed.ts:72-79`) | Refresh per academic year from the registrar source. Import path accepts only `name,block` columns (verified: `src/app/api/import/roster/route.ts` reads only `nameIdx`/`blockIdx`; extra columns ignored — good minimization) |
| Schedules | 36 rows from 2023 `1st Sem` (`seed.ts:119-169`) | Re-enter current-semester schedules; keep 2023 data as **dev fixture only** |

### 2.4 Retention (RA 10173 §11(e))

- **Flag (stale personal data):** the heartbeat timestamps of Sept–Oct 2023 are ~3 years old at review date (2026-10-14) and are presence/attendance traces of identifiable faculty. They persist in `seed.ts`, `code/prisma/dev.db`, and every seeded copy. **Retention fix:** null `lastHeartbeat` on production cutover; purge or archive per RSU's retention schedule.
- Suggested schedule (for DPO ratification): schedules — current + previous semester; roster — active academic year, then refresh; user accounts — deactivate on separation, delete after the university's policy period; session cookies — 7 days (already implemented, `session.ts`); schedule CSV exports — workstation-handled, contain only what the screen shows (faculty/block/subject/room — no student PII by design).

### 2.5 Security obligations (RA 10173 §20; NPC Circular 16-01) mapped to implemented controls

| Obligation | Implemented control (evidence) | Status |
| :--- | :--- | :--- |
| Technical safeguards for credentials | bcrypt hashing, cost 10 (≥ NFR-005's minimum): `seed.ts` lines 20, 188, 199; `docs/REQUIREMENTS.md` NFR-005 | Implemented |
| Session security | `httpOnly` + `SameSite=Lax` + `secure` (production) + 7-day expiry + logout cookie destruction: `src/lib/session.ts` lines 69–89; NFR-005 | Implemented (requires HTTPS in production for `secure` to bind — condition C5) |
| Injection resistance | Prisma parametrized access only, no raw SQL interpolation: NFR-002 (`docs/REQUIREMENTS.md`); grep of `src/` confirms no `fs`/SQL string patterns | Implemented |
| Secret management | `AUTH_SECRET` from `.env` (gitignored — `code/.gitignore` line 4), ≥32 chars enforced at runtime: `session.ts` lines 20–26; `.env.example` documents both variables; NFR-003 | Implemented |
| Input validation | zod at API boundary: NFR-004; `src/lib/schemas.ts` present | Implemented |
| Route protection | `src/middleware.ts` + `guard(role)` per API route (e.g., roster import: `src/app/api/import/roster/route.ts` line 11 `guard("ADMIN")`) | Implemented |

**Gaps / required actions:**
- **Dev-only credentials** `admin123` / `faculty123` exist in `seed.ts` lines 21–23. They must never exist in a production deployment (C4/C6).
- **Ported legacy `$2y$` hashes** (six faculty) mean legacy passwords still work in 2.0. Those hashes are 2023-vintage and of unknown legacy hygiene — force a password reset on first production login for any account using a ported hash (C6).
- `dev.db` contains real names + hashes + heartbeats; gitignored but on disk — do not copy into backups/shares (C4).

### 2.6 Roster CSV import (PII ingestion path)

Verified behavior of `src/app/api/import/roster/route.ts`: admin-only (`guard("ADMIN")`), multipart upload, hard 2 MB cap (line 8, 24), header must be `name,block` (lines 29–36), row-level validation with per-row errors, unknown block names rejected (no auto-creation), in-memory parse via `parseCsv` — **no disk persistence anywhere in `src/`** (grep for `writeFile|appendFile|createWriteStream|formidable|busboy|multer|fs` = zero hits).

Recommendations (condition C7): (a) append an audit-log entry per import (admin id, timestamp, created/updated/skipped counts); (b) instruct operators to obtain roster CSVs only from the registrar system and to delete local copies after import; (c) surface the privacy notice at the import screen; (d) keep the 2 MB cap (prevents bulk-harvest style uploads).

### 2.7 Data subject rights and governance (RA 10173 §§16, 20-A; IRR)

- **Rights (§16):** access, correction, erasure, objection, portability, damages. For this app, DSARs are servable through admin management surfaces (faculty/roster CRUD) — document the procedure and a response SLA in RSU's privacy manual.
- **DPO:** RSU must have a designated DPO (IRR Rule VIII; NPC Advisory 2017-01). This review's conditions are addressed **to the DPO for sign-off** (C3).
- **NPC registration/reporting:** a SUC of RSU's size plausibly exceeds NPC Circular 17-01 registration thresholds (≥250 employees, or sensitive data of ≥1,000 individuals); this app should be listed in the university's existing registration/privacy manual rather than treated separately — DPO to confirm.
- **Breach procedure (§20-A; NPC Circular 16-03):** 72-hour NPC notification duty; add this app's SQLite file + server to the university's breach-scenario inventory (a stolen laptop with `dev.db` is a notifiable scenario if real student/faculty data is present).
- **Automated processing (§18):** status badges (`Vacant N day(s)`, etc.) are schedule arithmetic, not decisions producing legal effects — no §18 compliance duty.

### 2.8 GDPR / CCPA — material-difference notes only

- **GDPR:** unlikely to apply (no EU establishment or targeting foreseen). If EU/EEA exchange students or staff were ever onboarded: lawful basis would be Art. 6(1)(e) public task (mirrors §12(f)); the faculty **presence heartbeat** would warrant a DPIA screen under Art. 35 (systematic workplace monitoring); DSAR response deadline would be one month. No other material delta.
- **CCPA/CPRA:** not applicable — RSU is not a for-profit "business" meeting the thresholds, and no personal information is sold or shared for cross-context advertising. Recorded for completeness; no action.

## 3. IP / attribution

### 3.1 RSU name, logos, and branding

- **Legacy tree only (verified):** `educLogo.png`, `rsuLogo.png`, `ItLogo.png` exist at the legacy repo root (`E:\sideQuest\Web-based-Classroom-Utilization-Management-System-2.0\`) and in legacy copies (`Admin\HomeMainFunc\rsuLogo.png`, `Admin\images\rsuLogo.png`, `Faculty\educLogo.png`, `Students\rsuLogo.png`, plus `.kilo` worktree duplicates). The legacy `Admin\assets\` and `Admin\img\slider\` trees (Revolution Slider art, etc.) and `Admin\baguetteBox.js-dev\` also live only there.
- **New app references none (verified):** `code/src` grep for `educLogo|rsuLogo|ItLogo` → **0 hits**; there is **no `code/public/` directory**; grep for `bootstrap|jquery|html2pdf|baguette|nice-select|niceSelect|revolution|ticker|AOS|font-awesome|fontawesome|cdn.` → **0 hits**. The 2.0 deliverable bundles no third-party frontend assets and no RSU image assets.
- **Assessment:** the RSU name and logos are the university's own institutional property; as RSU is both rights-holder and deployer, internal use carries no third-party IP exposure. If branding is later added to 2.0, source the official assets through RSU institutional channels (keeps provenance clean and avoids stale legacy copies). Nothing in 2.0 currently requires trademark or logo licensing action.

### 3.2 Legacy vendored assets — license non-attachment

Bootstrap/jQuery CDNs, AOS, Nice Select, Revolution Slider, baguetteBox, the ACME news ticker, and html2pdf.js are **absent from the 2.0 code** (grep evidence above; zero matching packages in the dependency tree per LICENSE-AUDIT §5). Whatever their licenses, none attach to the 2.0 deliverable. The legacy PDF export (html2pdf.js) was replaced by a print-friendly view per PROJECT-CHARTER §2 — no PDF library dependency exists in the tree.

### 3.3 Ported domain logic

`statusFunc()` / `getQuarter()` semantics were re-implemented in `src/lib/status.ts` / `src/lib/semester.ts` from RSU's own legacy PHP (institution's own code, not third-party IP) — no external IP claim attaches.

## 4. Terms-of-service exposure

**Runtime (end-user traffic): none.**
- `code/src` contains **zero `http(s)://` URL literals** (grep evidence) — the app makes no third-party API calls; all fetches go to same-origin API routes.
- `code/package-lock.json` grep for `sentry|analytics|gtag|segment|mixpanel|posthog|amplitude|hotjar|clarity|matomo` → **0 hits**; no analytics/telemetry package exists anywhere in the 88-package tree (full inventory: LICENSE-AUDIT §5).
- No CDN references (grep `cdn.` → 0 hits). No third-party service is invoked at runtime, therefore **no ToS acceptance is required for any runtime dependency**.

**Dev/build-time (developer machine only) — flagged, not blocking:**
- **Next.js telemetry** is enabled by default and collects anonymous usage data (command invoked, Next.js version, general machine info, plugins present, build duration/size, MCP tool-invocation counts); Vercel states it does not collect sensitive data such as env vars, file paths, file contents, or logs. Opt-out: `NEXT_TELEMETRY_DISABLED=1` or `npx next telemetry disable` (source: nextjs.org/telemetry, fetched 2026-10-14). The project does **not** set the opt-out (`next.config.ts` is an empty config; `.env.example` lacks the variable).
- **Prisma CLI**: engine binaries are downloaded at install from `binaries.prisma.sh` (host string verified in the installed `code/node_modules/prisma/build/index.js`); the CLI's version-check "checkpoint" honors `CHECKPOINT_DISABLE` (verified in the installed bundle: guard `if((process.env.CHECKPOINT_DISABLE||a.disable)&&!a.force)return{status:"disabled"}`; 3 occurrences of the env var, 2 of `PRISMA_HIDE_UPDATE_MESSAGE`, and **0 occurrences of `sentry`** — i.e., no error-reporting sink in the installed build).
- **Recommendation (C2):** in the institutional build/dev environment set `NEXT_TELEMETRY_DISABLED=1` and `CHECKPOINT_DISABLE=1` — this eliminates the only outbound metadata flows; none of them touch end-user personal data.

## 5. Verdict

### **CLEAR-WITH-CONDITIONS**

The system is legally deployable for RSU internal educational use once the following conditions are met. Nothing found is blocking: no copyleft contamination, no unlawful-basis obstacle, no third-party runtime exposure, no unknown licenses.

| # | Condition | Owner |
| :-- | :--- | :--- |
| C1 | Ship `code/THIRD-PARTY-NOTICES.md` (content list: LICENSE-AUDIT §6) — satisfies caniuse-lite CC-BY-4.0 attribution and all permissive-license notice clauses | Run team |
| C2 | Set `NEXT_TELEMETRY_DISABLED=1` + `CHECKPOINT_DISABLE=1` in institutional dev/build environments (or document acceptance of the anonymous dev-time telemetry) | Run team / RSU IT |
| C3 | **RSU DPO sign-off** before production deployment: lawful-basis memo (RA 10173 §12(f)/(b)), privacy notice on login/registration screens, DSAR + breach procedures extended to this app | RSU DPO |
| C4 | Production data minimization: production seed with `lastHeartbeat = null` (no 2023 heartbeats), current-semester schedules and roster only; `dev.db` (real names) never leaves the dev machine and is never copied to shared storage | Run team / RSU IT |
| C5 | Enforce HTTPS in production so the `Secure` cookie flag binds (NFR-005 companion) | RSU IT |
| C6 | Credential hygiene: no `admin123`/`faculty123` in production; force password reset on first login for accounts with ported legacy `$2y$` hashes; `AUTH_SECRET` rotation plan (≥32 chars already enforced by `session.ts`) | Run team / RSU IT |
| C7 | Roster CSV import: add per-import audit logging (who/when/counts); operator guidance on CSV source handling and post-import deletion | Run team |
| C8 | Re-run LICENSE-AUDIT on any dependency change (caret ranges drift); keep the audit + this review updated in `docs/` | Run team |

## 6. Evidence appendix

- Data model and seed evidence: `docs/DATA-MODEL.md`; `code/prisma/seed.ts` (lines 20–23 dev credentials; 39–56 faculty incl. legacy `$2y$` hashes and 2023 heartbeats; 72–79 roster names; 119–169 schedules); `docs/EXISTING-PROJECT-ANALYSIS.md` §3 (legacy dump source, 2023 heartbeat note).
- Security-control evidence: `code/src/lib/session.ts` (cookie flags, JWT payload, logout destruction), `code/src/middleware.ts`, `code/src/app/api/import/roster/route.ts`, `code/.gitignore`, `code/.env.example`, `docs/REQUIREMENTS.md` NFR-001…NFR-006.
- Absence evidence (grep of `code/src`, patterns quoted inline in §2.1/§3.1/§4): zero legacy-asset references, zero external URLs, zero `fs` writes, zero `next/image` usage, no `public/` directory, zero analytics packages in the lockfile.
- Dependency evidence: `docs/LICENSE-AUDIT.md` (every license claim cited to an installed `package.json` / `LICENSE` file path).
- External citations: Next.js telemetry policy — nextjs.org/telemetry (fetched 2026-10-14); Prisma CLI behavior verified against the installed bundle `code/node_modules/prisma/build/index.js` (not from memory; the Prisma docs URL returned 404 at review time, so installed-code evidence was used instead).

_Review complete — 2026-10-14 11:26 · Legal/Compliance Agent · Final sign-off: RSU Data Protection Officer._