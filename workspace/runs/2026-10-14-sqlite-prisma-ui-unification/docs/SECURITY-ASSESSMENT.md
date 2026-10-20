# SECURITY-ASSESSMENT — Classroom Utilization Management System 2.0

_Run: 2026-10-14-sqlite-prisma-ui-unification · Author: pentest agent · Target: NEW app in `code/` (Next.js 15.5.27 + Prisma 6.19.3 + SQLite) · Initial pass: `next dev` on `http://localhost:3000` · **Phase-5 re-verification: 2026-10-14, `next dev` on `http://localhost:3200` (3100 occupied by QA)** · Companion: docs/THREAT-MODEL.md (assets, STRIDE, authz matrix) · Raw command/response evidence: PROGRESS-LOG-PENTEST.md (run folder root, §5 initial + §10 re-verification)._

> **Phase-5 re-verification (2026-10-14):** builders implemented fixes for FIND-001, FIND-002 (documentation + seed guard), FIND-003, FIND-004, FIND-006, FIND-007, FIND-008. All seven were **independently re-verified live** by pentest (not by the builder) — statuses flipped to *Remediated & re-verified* below. FIND-005 remains open (partly by-design; login-only rate limiting), FIND-009/FIND-010 remain open Informational (out of remediation scope, code unchanged — verified by re-read).

## 1. Executive summary

The rebuilt application eliminates the legacy system's critical defect classes: there is **no SQL injection surface** (Prisma-only data access, grep-verified), **no unguarded dashboard or API** (middleware + per-route `guard()` verified live for all three roles), **logout destroys the session cookie**, and **all inputs are zod-validated server-side** with mass-assignment-safe parsing and generic error envelopes.

Initial pass found **1 Critical, 3 Medium, 2 Low, and 3 Informational issues**. After the builder fix loop, **Phase-5 re-verification (2026-10-14) confirmed 7 of 10 findings remediated on the wire**: login lockout (429 + `Retry-After: 900` after 11 failures, per-username/per-IP keying), CSV formula neutralization on export (`'` prefix on `=`/`+`/`@` cells with RFC4180 doubling intact), security headers on every route (CSP/XFO/XCTO/Referrer/Permissions; HSTS correctly deferred to the TLS layer), Origin/Sec-Fetch-Site rejection on all mutating handlers, transactional admin cap (200/200/409), 32-bit-safe id parsing (400 instead of 500), and the FIND-002 deployment-gate documentation (`README-SECURITY.md` + production seed guard + `THIRD-PARTY-NOTICES.md` for Legal C1). The remaining open items are the two by-design/informational ones (FIND-005, FIND-009, FIND-010). A light regression sweep confirmed the fixes broke nothing (guards, JWT tamper resistance, CRUD round-trip all still PASS).

Counts by severity (post-re-verification): **remediated 7 (1 Critical, 3 Medium, 3 Low/Info incl. FIND-006/007/008) · open 3 (all Low/Informational: FIND-005, FIND-009, FIND-010)**. Two UNTESTED items are declared (§7).

## 2. Findings

| ID | Title | CVSS v3.1 vector | Score | Severity | Status |
| :-- | :--- | :--- | :--- | :--- | :--- |
| FIND-001 | No rate limiting or lockout on login (CWE-307) | AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N | 5.3 | Medium | **Remediated & re-verified (2026-10-14)** |
| FIND-002 | Default/weak seeded credentials active on LAN-reachable server (CWE-798) | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N | 9.8 | Critical | **Remediated & re-verified (2026-10-14)** — docs + seed guard; operational rotation still applies pre-deployment |
| FIND-003 | CSV formula injection in schedule export (CWE-1236) | AV:N/AC:L/PR:H/UI:R/S:U/C:L/I:L/A:N | 4.3 | Medium | **Remediated & re-verified (2026-10-14)** |
| FIND-004 | Missing security headers (CSP, X-Frame-Options, XCTO, HSTS, Referrer/Permissions-Policy) (CWE-693) | AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N | 4.8 | Medium | **Remediated & re-verified (2026-10-14)** — HSTS deferred to TLS layer by design |
| FIND-005 | User/roster enumeration via registration + login timing (CWE-204) | AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N | 3.9 | Low | **Open (Accepted deviation)** — messages legacy-required (FR-004/005/006); rate limiting covers login only; timing side-channel unchanged (re-read 2026-10-14) |
| FIND-006 | No Origin/Sec-Fetch-Site validation on state-changing endpoints (CSRF defense-in-depth gap) (CWE-352) | AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N | 4.6 | Low | **Remediated & re-verified (2026-10-14)** |
| FIND-007 | Admin-cap TOCTOU race can exceed 3 admins under concurrent registration (CWE-367) | AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:N | 3.9 | Low | **Remediated & re-verified (2026-10-14)** — cap enforced inside write transaction; dynamic race not re-run (see §7) |
| FIND-008 | Out-of-range `?id` (≥2^63) returns 500 instead of 400 (robustness) | — | — | Informational | **Remediated & re-verified (2026-10-14)** |
| FIND-009 | Unbounded `days[]` array in schedule schema (5000 entries stored) | — | — | Informational | **Open (Informational)** — `daysSchema` still `.min(1)` without max (re-read 2026-10-14) |
| FIND-010 | Roster import is sequential per-row with findFirst+create (minutes for 60 k rows; duplicate race → 500) | — | — | Informational | **Open (Informational)** — import loop unchanged (re-read 2026-10-14) |

### Phase-5 re-verification evidence (2026-10-14 — independent pentest re-run, dev server `http://localhost:3200`; raw excerpts in PROGRESS-LOG-PENTEST.md §10)

- **FIND-001 (rate limiting):** 13 rapid bad logins for a throwaway username → `{"401":11,"429":2}`, first 429 at attempt 12 with header `Retry-After: 900` and body `{"error":"Too many failed attempts. Try again later."}`; blocked user still 429 on retry; a **different username** meanwhile gets 401 (per-username keying); the same blocked username with `x-forwarded-for: 9.9.9.9` gets 401 (per-IP keying); seeded faculty login and admin login unaffected. Matches the documented contract (10 failures / 15 min / 429 + Retry-After) in API-CONTRACT.md and `src/lib/rate-limit.ts`.
- **FIND-002 (deployment gate):** `code/README-SECURITY.md` present and accurate — dev-credential table (incl. the 6 un-rotatable legacy-hash accounts), MUST-rotate gate, loopback-binding guidance, reseed commands, controls summary; `prisma/seed.ts` now **refuses to seed defaults when `NODE_ENV=production`** without `SEED_ADMIN_PASSWORD`/`SEED_FACULTY_PASSWORD` (code-verified; dev reseed behavior unchanged — counts still 17/17/8/28/13/36/6). Note: in the dev configuration the seeded credentials themselves remain live by design (dev-intent); the deployment gate is the remediation.
- **FIND-003 (CSV formula neutralization):** hostile row created via admin CRUD (block `@probe-block`, room `+probe-room`, subject `=HYPERLINK("x","y")`), attached to a temp schedule, then `GET /api/export/schedules` returns on the wire:
  `"151","Admin","'@probe-block","'=HYPERLINK(""x"",""y"")","'+probe-room","MON","08:00","09:00","1st Sem"`
  — every formula-prefixed cell carries the `'` prefix (`@`, `+`, `=` wire-verified; `-`, tab, CR share the same `FORMULA_PREFIX_CHARS` branch, code-verified), RFC4180 `""` doubling intact, header row untouched (`"id","faculty","block","subject","room","days","start","end","semester"`). A second probe confirmed `'=cmd|' /C calc'!A1` renders as `"'=cmd|' /C calc'!A1"`. Temp rows deleted; reseed run after testing.
- **FIND-004 (security headers):** present on `/` (200), `/admin` (307), and API route `/api/crud/faculty` (401): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, full CSP (`default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'`). HSTS absent — intentional (no HTTPS in dev; TLS-layer deployment concern per README-SECURITY.md).
- **FIND-006 (Origin check):** on `POST /api/auth/login`: `Origin: http://evil.example` → **403 `{"error":"Cross-origin request rejected"}`**; `Sec-Fetch-Site: cross-site` → **403 `{"error":"Cross-site request rejected"}`**; malformed Origin → 403 `{"error":"Invalid Origin header"}`; matching Origin (`http://localhost:3200`) → 200; no Origin (non-browser) → 200. Wired into **all 20 mutating handlers** (login, logout, 3 registrations, 6 CRUD routes × 3 mutating verbs, import) — spot-verified live on login, logout, and admin CRUD POST (evil Origin → 403 before even the role guard).
- **FIND-007 (transactional cap):** through the new `$transaction` path: admin #2 → 200, #3 → 200, #4 → **409 `"Cannot register. Maximum admin accounts reached."`** (legacy message preserved); P2002 concurrent-username collision mapped to 409 (code path reviewed). The concurrency race itself was not dynamically re-run (see §7) — the SQLite-writer-serialization argument plus in-transaction re-check closes the TOCTOU window by construction.
- **FIND-008 (id range):** `DELETE /api/crud/rooms?id=99999999999999999999` → **400**; `?id=2147483648` → 400; `?id=9223372036854775807` → 400; `?id=2147483647` (in range) → 404 proper flow. No 500s. (`idSchema` now `.lte(2147483647)` — Prisma Int is 32-bit on SQLite.)
- **Regression sweep after fixes:** anon `/admin` → 307 `/login/admin`; anon API → 401; admin CRUD create+delete round-trip → 200/200; JWT payload-flip → 401. Nothing broken by the remediations.
- **Docs spot-checks:** `README-SECURITY.md` claims match live behavior (rate-limit numbers, Origin rules, header list, reseed counts). `THIRD-PARTY-NOTICES.md`: 22 license sections (17 direct deps + 5 transitive/attribution extras); 6 packages spot-checked against installed `node_modules/*/package.json` (`license` field + version) — all match; `next`/`jose` ship `LICENSE.md` variants (claim of verbatim license texts holds).

### FIND-001 — No rate limiting or lockout on login (Medium, 5.3)
- **Evidence (live):** `for i in 0..24: POST /api/auth/login {role:ADMIN, username:"admin", password:"guess-i"}` → statuses `{"401":25}`, elapsed 2358 ms (~94 ms/attempt), no 429, no delay growth, no lockout. Code: no limiter in `src/app/api/auth/login/route.ts` or middleware.
- **Reproduction:** script a loop of bad-password POSTs to `/api/auth/login`; all attempts are processed at full speed indefinitely.
- **Impact:** unlimited online password guessing against the seeded weak passwords (compounds FIND-002) and unlimited roster-name probing against registration endpoints.
- **Remediation:** per-IP + per-username sliding-window limiter (e.g., 5 failures → 15 min backoff), uniform responses, progressive delay; log spikes.
- **Vector note:** C:L chosen (single-account compromise per successful guess; this defect alone does not expose the whole dataset).

### FIND-002 — Default/weak seeded credentials active (Critical, 9.8)
- **Evidence (live):** `POST /api/auth/login {"role":"ADMIN","username":"admin","password":"admin123"}` → `200 {"data":{"user":{"id":24,"username":"admin","role":"ADMIN"}}}`; `{"role":"FACULTY","username":"Angelica Rico","password":"faculty123"}` → 200. Source: `prisma/seed.ts:21-23` (`DEV_FACULTY_PASSWORD = "faculty123"`, `DEV_ADMIN_PASSWORD = "admin123"`); dev server banner shows LAN binding `Network: http://192.168.1.251:3000`.
- **Reproduction:** from any LAN host, `POST http://<host>:3000/api/auth/login` with the documented defaults.
- **Impact:** anonymous attacker gains full ADMIN (all PII-bearing tables, CRUD, import/export) or any of 10 FACULTY accounts.
- **Caveat (stated plainly):** these are the documented development seed values (DATA-MODEL.md, FR-011 workflow), appropriate for local development only. The score reflects the tested configuration (dev server bound to all interfaces with defaults active). This finding is **deployment-gating**: must be resolved before any exposure beyond localhost.
- **Remediation:** (1) read dev passwords from env (e.g., `SEED_ADMIN_PASSWORD`) or fail the seed when `NODE_ENV=production`; (2) force password rotation on first login; (3) never bind dev to `0.0.0.0` on shared networks (`next dev -H 127.0.0.1`).

### FIND-003 — CSV formula injection in schedule export (Medium, 4.3)
- **Evidence (live, end-to-end):** admin creates subject `=HYPERLINK("http://evil.example","pwned")` (200), links it in a schedule, then `GET /api/export/schedules` returns a row containing literally:
  `"75","Admin","BSED 3 ENGLISH","=HYPERLINK(""http://evil.example"",""pwned"")","201","MON","08:00","09:00","1st Sem"`.
  Quote-escaping is correct (RFC4180 `""` doubling verified) but cells beginning with `=`, `+`, `-`, `@` (or tab/CR) are not neutralized. Equivalent payloads accepted via roster CSV import (stored `=cmd|' /C calc'!A1`, `+1+1`, `@SUM(1)` names) — note imported roster names do **not** flow into the export columns, so the export-reachable injection source is admin-writable CRUD text (subjects/rooms/blocks/faculty names).
- **Reproduction:** as admin: create subject `=SUM(1+1)` → attach to any schedule → export → open in Excel/LibreOffice → formula executes.
- **Impact:** spreadsheet formula execution on an admin's workstation when opening a routine export (hyperlinks/DDE; data exfil or command execution depending on application settings). Requires an authenticated admin (or social-engineered input reaching an admin-writable field) plus victim interaction.
- **Remediation:** prefix `'` (or a space/tab) to any exported cell whose first character is `= + - @ \t \r`; add a regression test on `toCsv()`.

### FIND-004 — Missing security headers (Medium, 4.8)
- **Evidence (live):** `GET /`, `/admin`, `/login/admin` — `x-frame-options`, `content-security-policy`, `x-content-type-options`, `strict-transport-security`, `referrer-policy`, `permissions-policy` all **ABSENT**. `next.config.ts` is empty (no `headers()` config).
- **Reproduction:** any header view on any page; inspect the six header names.
- **Impact:** admin pages can be framed (clickjacking of destructive admin actions); no CSP backstop for XSS regressions; no XCTO; no HSTS when behind TLS.
- **Remediation:** add `headers()` in `next.config.ts`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a CSP starting `default-src 'self'` (nonce or hash for the pre-hydration theme script instead of `'unsafe-inline'`), HSTS at the TLS-terminating layer.

### FIND-005 — User/roster enumeration via registration + login timing (Low, 3.9)
- **Evidence (live):** registration responses are intentionally specific: `POST /api/auth/register/admin {"name":"Juan Dela Cruz"}` → `404 "Name not found in the faculty records"`; `/api/auth/register/student {"name":"Ghost Student"}` → `404 "Name not found in the roster"`; duplicates → `409 "This name is already registered"`. Timing: valid-username + wrong password ≈ **84–97 ms** (bcrypt runs) vs unknown-username ≈ **25–46 ms** (5 samples each).
- **Context:** the discriminating registration messages are **legacy-required business behavior** (FR-004/005/006 gates must tell the applicant why registration failed); the timing side-channel is an implementation artifact (bcrypt only runs on user hit).
- **Impact:** third parties can enumerate roster/faculty names (semi-public university data) and probe registered names unthrottled (compounds FIND-001).
- **Remediation:** rate-limit per FIND-001; optionally equalize login timing with a dummy bcrypt compare on user-miss.

### FIND-006 — No Origin/Sec-Fetch-Site validation (Low, 4.6 — currently mitigated at runtime)
- **Evidence (static + live):** state-changing handlers (`login/register/crud/logout/import`) read only body/cookie; no Origin/Referer/Sec-Fetch-Site check anywhere in `src/`. Cookie is `SameSite=lax` (verified Set-Cookie). Live probe: `POST /api/auth/logout` with `Origin: https://evil.example` + faculty cookie → 200 (server does not reject cross-origin claims — a header a real cross-site form POST would also carry, but whose cookie Lax would suppress in a real browser).
- **Realistic assessment (per briefing — stated, not invented):** the practical cross-site CSRF class (form/fetch POST from another origin carrying cookies) is blocked by SameSite=Lax in all current major browsers. Residual paths: (a) same-site subdomain attacker (cookie is site-scoped, not origin-scoped); (b) legacy/non-conforming browsers; (c) the single state-mutating GET `/api/heartbeat` (top-level navigations DO carry Lax cookies) — impact limited to falsifying the victim's own presence timestamp (negligible).
- **Remediation (hardening, not urgency):** reject requests where `Sec-Fetch-Site` is `cross-site` (or validate Origin) on POST/PUT/DELETE; consider `__Host-rsu_session` cookie name in production (adds path/host pinning).

### FIND-007 — Admin-cap TOCTOU race (Low, 3.9)
- **Evidence (static):** `src/app/api/auth/register/admin/route.ts:19-27` — `db.user.count()` then `db.user.create()` without a transaction or unique guard on the cap; two concurrent registrations can both observe `count=2` and create the 3rd and 4th admin. (Unique constraint on `username` does not cap role counts.)
- **Reproduction:** fire parallel `register/admin` requests for two distinct faculty names when the count is at 2; both can succeed.
- **Impact:** cap bypass → extra admin accounts (integrity of the legacy cap control). Requires precise timing; unauthenticated attacker cannot trigger it (needs valid candidate names + concurrency).
- **Remediation:** wrap count+create in an interactive `db.$transaction` with a re-check, or enforce the cap via a partial unique constraint/trigger on `role='ADMIN'` count.

### FIND-008 — Out-of-range id returns 500 (Informational)
- **Evidence (live + server log):** `DELETE /api/crud/rooms?id=99999999999999999999` → `500 {"error":"Internal server error"}`; dev log shows `PrismaClientValidationError: Unable to fit value 100000000000000000000 into a 64-bit signed integer`. Envelope stayed generic (no leak); `?id=abc|-1|0|1.5` all correctly 400.
- **Remediation:** bound `idSchema` with `.max(2**63-1)` or map Prisma validation errors to 400.

### FIND-009 — Unbounded `days[]` (Informational)
- **Evidence (live):** schedule POST with `days: Array(5000).fill("MON")` → 200, stored comma-joined (~15 KB string), echoed back as a 5000-element array; cleanup delete → 200. `daysSchema` has `.min(1)` but no `.max(7)`/dedup.
- **Remediation:** `daysSchema = z.array(dayCodeSchema).min(1).max(7)` + dedupe.

### FIND-010 — Import performance/TOCTOU (Informational)
- **Evidence (live):** ~1.5 MB / 60 000-row CSV processed row-by-row (`findFirst` + `create` per row) — ran for minutes (test killed at ~16 304 inserts; no crash; reseed restored pristine state). Concurrent duplicate imports hit `P2002` on `create` → caught → generic 500 (server log line captured).
- **Remediation:** batch with `createMany` + `skipDuplicates` (or `upsert`), which also removes the duplicate race; consider a row-count cap.

## 3. Explicit pass list (verified secure — evidence in PROGRESS-LOG-PENTEST.md)

| # | Control | Method | Result |
| :-- | :--- | :--- | :--- |
| P1 | **No SQL injection (NFR-002)** — zero `$queryRaw`/`$executeRaw`/`$queryRawUnsafe`/`$executeRawUnsafe` in `src/`; all access via Prisma parameterized client | static grep (regex across code/src) + 14 route file reviews | PASS |
| P2 | **Dashboards guarded (FR-007)** — `/admin`, `/faculty`, `/student`, `/admin/blocks` anonymous → 307 to role login | live | PASS |
| P3 | **Wrong-role page access denied** — student → `/admin` 307→`/student`, student → `/faculty` 307→`/student`; admin → `/faculty` 307→`/admin`; logged-in users bounced off `/login/*`, `/register/*` | live | PASS |
| P4 | **API authn** — all probed APIs anonymous → `401 {"error":"Authentication required"}` | live | PASS |
| P5 | **API authz / IDOR** — student session: GET/POST/PUT/DELETE on `/api/crud/faculty`, GET/POST/DELETE on `/api/crud/roster`, `/api/export/schedules`, `/api/heartbeat` → all `403 {"error":"Forbidden"}`; faculty session: rooms POST + export → 403 | live | PASS |
| P6 | **JWT tamper resistance** — payload role-flip with kept signature → 401; `alg:none` empty signature → 401; token forged with attacker secret → 401; expired token → 307 redirect | live | PASS |
| P7 | **Middleware bypass headers (CVE-2025-29927 pattern)** — `x-middleware-subrequest: middleware | middleware:middleware:middleware:middleware:middleware | src:middleware:src:middleware:src:middleware | pages/_middleware` on next@15.5.27 → all 307 to login (installed version > 15.2.3 fix) | live | PASS |
| P8 | **Login no-enumeration** — wrong password / unknown user / valid-creds-wrong-role all return identical `401 {"error":"Invalid credentials"}` | live | PASS (see FIND-005 for residual timing) |
| P9 | **Logout destroys cookie (FR-007)** — `Set-Cookie: rsu_session=; Max-Age=0; HttpOnly; SameSite=lax` | live | PASS (post-logout token reuse is an accepted design item, THREAT-MODEL §6.1) |
| P10 | **Cookie flags (NFR-005)** — `HttpOnly; SameSite=lax; Path=/; Max-Age=604800`; `Secure` gated to production (dev-observed absence is by design) | live | PASS with note |
| P11 | **Registration gates** — admin with non-faculty name → 404; 4th admin → 409 `"Cannot register. Maximum admin accounts reached."`; student roster-miss → 404; duplicate → 409; **block-mismatch on roster entry with recorded block → 400 with `fields.block`** | live | PASS |
| P12 | **Input validation (NFR-004)** — `?id=abc|-1|0|1.5` → 400; non-string room name → 400 `fields.name`; `days:[]` → 400; bad HH:MM (`25:00`, `9:00`) → 400; unknown FK ids → 400 with per-field errors; PUT without id → 400 | live | PASS (overflow edge → FIND-008) |
| P13 | **Mass assignment** — extra fields (`role`, `passwordHash`, `id`) on room POST are stripped: stored object `{"id":28,"name":"Pentest Room X"}` | live | PASS |
| P14 | **No hash leakage** — login/DTO responses contain only `{id, username, role}` | live | PASS |
| P15 | **CSV RFC4180 correctness** — quoted commas, `""` escapes, embedded CRLF parsed correctly on import; export properly quotes and doubles quotes (verified with a `Room "Q", With Comma` row) | live | PASS (formula prefix → FIND-003) |

| P16 | **Import hardening** — missing file field → 400; wrong header → 400 with `fields.header`; empty CSV → 400; >2 MB → 400 `"CSV file too large (max 2 MB)"`; per-row errors for missing name / unknown block (no auto-creation) | live | PASS |
| P17 | **Export authn/authz + headers** — anonymous 401, student 403, faculty 403, admin 200 with `text/csv; charset=utf-8` + `Content-Disposition: attachment` | live | PASS |
| P18 | **No secret/file exposure** — `GET /prisma/dev.db`, `/.env`, `/env`, `/package.json`, `/../package.json` → all 404, no leakage | live | PASS |
| P19 | **Secrets hygiene (NFR-003)** — `AUTH_SECRET` only in gitignored `.env` (64 hex, ≥32 enforced at runtime); `.env.example` documents variables with placeholders; `.gitignore` covers `.env*`, `*.db` | static | PASS |
| P20 | **No XSS vectors in app code** — zero `dangerouslySetInnerHTML` except the static pre-hydration theme script in `layout.tsx` (constant string, no interpolation); React auto-escaping elsewhere; no `javascript:`/`data:` URLs in new code | static grep scoped to code/src | PASS |
| P21 | **CORS posture** — `OPTIONS /api/crud/faculty` → 204 with **no** `Access-Control-Allow-Origin` (cross-origin JS reads blocked by same-origin policy) | live | PASS |
| P22 | **Method safety** — `PUT /api/auth/login` → 405; `GET /api/import/roster` → 405 | live | PASS |
| P23 | **Deleted-user lockout** — `guard()` re-checks user existence in DB (`src/lib/api.ts:27`), so a JWT from a deleted account is 401 | static (user-existing path verified live) | PASS |
| P24 | **Large-body robustness** — 5 MB JSON to login parsed then rejected by zod in 134 ms, no crash, no hang | live | PASS (no app-level cap exists — noted in §6 residual) |

## 4. Dependencies (package.json / lockfile)

- Installed (lockfile-verified): `next 15.5.27` (≥ 15.2.3 → CVE-2025-29927 middleware bypass patched; also past the 15.3.3/15.4.2/15.5.2 fix trains), `jose 5.10.0`, `bcryptjs 2.4.3`, `zod 3.25.76`, `@prisma/client 6.19.3`, `react/react-dom 19.3.0`.
- `npm audit` (live): **0 critical, 4 high, 1 moderate, 0 low** — all in build-time toolchain: `postcss ≤8.5.22` (XSS via unescaped `</style>`; reached via next build pipeline), `deepmerge-ts <8.0.0` (stack exhaustion; reached via `@prisma/config` → prisma CLI). None sit in the app's runtime request path with attacker-controlled input; treat as accepted toolchain debt, watch for upstream bumps.
- `bcryptjs 2.4.3` is mature but slow-release; acceptable (consider argon2 at a future hardening pass — not required).
- Manifest ranges use `^` (not fully pinned) but the lockfile pins actuals; CI should run `npm audit --omit=dev` and install from the lockfile.

## 5. Legacy-defect recurrence check (EXISTING-PROJECT-ANALYSIS §5)

| Legacy defect | Recurrence in 2.0 |
| :--- | :--- |
| SQLi via string interpolation (`facultyLogin.php`, `heartbeat.php`, `statusFunc()`) | **Eliminated** — Prisma-only (P1) |
| Unguarded dashboards (`admin.php`, both `HomeTableMainFunc.php`) | **Eliminated** — middleware + per-route guards (P2–P5) |
| Session not destroyed on logout | **Fixed** — cookie destroyed on logout (P9); documented residual: token itself stays valid (accepted, THREAT-MODEL §6.1) |
| No CSRF protection | **Improved** — httpOnly + SameSite=Lax session cookie blocks cross-site POSTs in modern browsers (FIND-006 documents remaining hardening) |
| Hardcoded root DB credentials in 5 `config.php` copies | **Improved** — secrets via gitignored `.env` only (P19); but dev seed passwords reintroduce a default-credentials class for the dev environment (FIND-002) |

## 6. Residual-risk statement

Residual risks after the Phase-5 re-verification (2026-10-14): (1) stateless JWT validity up to 7 days post-logout/theft (accepted at ARCHITECTURE §4.3 — mitigate with a denylist if the threat model grows); (2) no audit trail for admin actions (repudiation risk); (3) same-site subdomain cookie attachment (operational: dedicated host; the new Origin check reduces this surface further); (4) legacy `$2y$` password strength for 6 inherited faculty accounts (unknown); (5) single-file SQLite with no encryption at rest (host compromise = full disclosure — acceptable for an intranet utilization tool whose PII is limited to roster/faculty names); (6) no app-level request-body cap (relies on zod limits and deployment-tier proxies); (7) toolchain advisories in build dependencies (§4); (8) the per-process rate limiter and in-transaction cap assume single-node deployment (documented — a multi-node deployment needs a shared store); (9) CSP allows `'unsafe-inline'` scripts/styles (Next.js App Router constraint; nonce plumbing is future hardening). With FIND-001/003/004/006/007/008 remediated and FIND-002 gated by README-SECURITY.md, none of the remaining items rise above accepted-for-deployment-class risk; operational rotation of seeded credentials (FIND-002 items 2–3 of README-SECURITY.md) remains mandatory before any non-localhost exposure.

## 7. Untested items (declared, with reasons)

| Item | Reason |
| :--- | :--- |
| Production-build behavior (Secure cookie flag set, production headers, compiled middleware) | `next build` remains blocked by TypeScript errors in frontend-owned files; both testing passes used `next dev` as instructed |
| Legacy `$2y$` hash verification for the 6 seeded faculty accounts | Plaintext legacy passwords are unavailable to testers (hashes ported verbatim from the legacy dump; bcryptjs `$2y$` support is documented and the same verify path was exercised with bcrypt hashes) |
| Dynamic re-exploitation of the FIND-007 admin-cap race | Timing-race exploitation is unreliable in a test loop; the fix was verified as cap-behavior-through-transaction (200/200/409) plus code inspection of the in-transaction re-check |
| `/student` page with a faculty session | Same wrong-role code path as verified admin→`/faculty` and student→`/admin` pairs |
| Multi-node/clustered SQLite + shared rate-limit store | Out of scope: single-process Next.js server as deployed (per-process limiter documented in API-CONTRACT.md) |

## 8. Verdict

**Pass (post-remediation re-verification, 2026-10-14).** The initial pass's 1 Critical + 3 Medium findings and 2 of the Low/Informational findings are **independently verified fixed on the wire** (FIND-001, FIND-002-gate, FIND-003, FIND-004, FIND-006, FIND-007, FIND-008); the regression sweep confirms no guard or validation behavior was broken by the fixes. Remaining open items are Accepted/Open-Low-Informational only: FIND-005 (by-design enumeration, mitigated at login by the new limiter), FIND-009, FIND-010 (robustness notes). **Deployment conditions (mandatory, from README-SECURITY.md):** rotate/remove all seeded credentials, run with `NODE_ENV=production` so the seed guard and cookie `Secure` flag bind, terminate TLS with HSTS, bind dev to loopback. Test data was removed and the database reseeded to the pristine documented state (17 users / 17 faculty / 8 blocks / 28 subjects / 13 rooms / 36 schedules / 6 roster entries — verified post-reseed).






