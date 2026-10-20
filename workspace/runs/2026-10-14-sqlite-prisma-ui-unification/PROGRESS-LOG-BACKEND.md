# PROGRESS-LOG-BACKEND — Run 2026-10-14-sqlite-prisma-ui-unification

_Agent: backend · Task: task_0001 · Started: 2026-10-14 (UTC) · All timestamps UTC._

---

## 2026-10-14 — Setup & doc review

**What:** Claimed task_0001. Read all mandated docs in order: EXISTING-PROJECT-ANALYSIS.md, PROJECT-CHARTER.md, REQUIREMENTS.md, ARCHITECTURE.md, TECH-STACK.md, PLAN.md, INTERFACE-TYPES.md. Read legacy sources (read-only) for exact porting semantics:
- `db/educ_room_utilization.sql` — full seed data (17 it_faculty rows, 7 blocks_detail rows, 6 exprimental_studentlist rows, 13 rooms, 28 subjects, 36 table_sched rows, 1 admin_register row).
- `Faculty/HomeTableMainFunc.php` lines 132–235 — exact `statusFunc()` logic.
- `student_register.php` — legacy student registration gate (name-only check against roster; block stored, not verified).
- `facultyRegister.php` — password activation only when `it_faculty.password IS NULL/''`.
- `adminRegister.php` — name must exist in it_faculty + `COUNT(admin_register) < 3`.
- `Faculty/heartbeat.php` — `UPDATE it_faculty SET timestamp = NOW() WHERE Name = session user`.
- `Admin/Scheduling_SystemSimple PHP/schedulingsystem/processCSV.php` — legacy roster import was comma-split, name-only; frozen contract (header `name,block`) supersedes.
- Legacy CSV export was client-side JS (tablelist.php) → server-side column set is defined by us in API-CONTRACT.md.

**Environment verified:** npm install complete (Leader-verified + install-out.log shows "added 88 packages", postinstall ran `prisma generate` OK, Prisma Client v6.19.3). node_modules present (70 top-level dirs). Using `G:\npm.cmd` / `G:\npx.cmd` full paths per TECH-STACK.md.

## Design decisions (evidence-cited; deviations flagged to Leader at completion)

1. **`Schedule.facultyId` nullable (`Int?`), `onDelete: SetNull`.** Frozen ARCHITECTURE §3 does not mark it required, and the frozen status contract (FR-021 / statusFunc port) requires a `NO_FACULTY` state — impossible with a required FK. Legacy evidence: table_sched row 49 has `faculty='None'`; legacy statusFunc echoes "No Faculty" when no it_faculty row matches (HomeTableMainFunc.php:219-225). SetNull preserves schedules when a faculty member is deleted instead of destroying them via cascade.
2. **`RosterEntry.blockId` nullable (`Int?`).** All 6 legacy roster rows have `block=''` (empty). Making it required would either force inventing a fake block assignment or dropping the 6 verified rows (FR-011 requires 6 roster entries). Nullable preserves the legacy fact "no block recorded". FR-004 gate: name must match AND (entry has no block → any block accepted, mirroring legacy name-only check in student_register.php; else block must match). ARCHITECTURE §3 "blockId→Block" does not mark it required (compare explicit `userId? @unique` notation used elsewhere in the same section — the doc is consistent in using `?` when it means optional).
3. **Seed adds an 8th block `BTLED` (yearLevel "Not specified").** 5 of 36 schedule rows (ids 1,2,3,5,7) reference `blocks='BTLED'`, which does not exist in blocks_detail (7 rows). Schedule.blockId is a required FK; to carry the schedule data forward with the exact legacy display text ('BTLED' appeared verbatim in legacy utilization tables), a schedule-integrity block row is seeded. FR-011's "7 blocks" refers to blocks_detail (all 7 seeded verbatim); the 8th is schedule-integrity, documented here and in DATA-MODEL.md. FLAGGED to Leader as deviation.
4. **statusFunc threshold port — exact legacy code, not the compressed doc phrasing.** Legacy code (HomeTableMainFunc.php:174-206): red branch is `dateDiffDays > 0 || timeDiffMinutes > 900`; inside it, `days > 0` → "Vacant N day(s)", else (same calendar day, gap > 900 min) → "Unavailable X min" (≤60) / "Unavailable X hr(s)" (>60); otherwise Active (strictly between start/end) / Inactive. EXISTING-PROJECT-ANALYSIS §4.1 compresses this as "gap ≤ 15h → Unavailable", which inverts the legacy condition; the actual PHP is the source of truth (R1: cite files). Legacy strict inequalities (`$date1 > $date2 && $date1 < $date3`) ported exactly. Null heartbeat (possible in new schema, not in legacy) → skip gap check, fall back to time-window logic per ARCHITECTURE §6.
5. **Wire sentinel for no-faculty schedules:** ScheduleDTO.facultyId is frozen as `number`; a schedule without faculty serializes as `facultyId: 0`, `facultyName: "None"` (the literal legacy string displayed in table cells, HomeTableMainFunc.php:294 area) and status computed with `hasFaculty=false` → NO_FACULTY badge. Documented in API-CONTRACT.md. FLAGGED to Leader.
6. **FacultyProfile `Admin` linked to the admin User.** Legacy it_faculty row 1 is name 'Admin' (no password); legacy admin_register name 'admin' matched it only via MySQL ci collation. Linking the seeded admin user to the profile (a) preserves the legacy relationship and (b) blocks faculty-registration squatting on the name 'Admin' (register/faculty requires profile.userId == null).
7. **Legacy `$2y$` bcrypt hashes ported verbatim** for the 6 faculty with passwords (bcryptjs verifies $2y$ per TECH-STACK.md); the 10 without get dev password `faculty123` (cost 10) + User accounts, per briefing.
8. **Heartbeat timestamps ported verbatim** (2023, Manila local stored with +08:00 offset) — faithful seed; badges will correctly show `Vacant N day(s)` until faculty log in.

---

## 2026-10-14 — Backend implementation complete (libs, middleware, 14 API routes)

**What:** All backend code written and verified:
- `src/lib/types.ts` (frozen contract, verbatim), `session.ts` (edge-safe jose JWT — split from auth.ts so middleware never bundles bcryptjs), `auth.ts` (bcryptjs hash/verify + re-exports, cost 10), `semester.ts` (getQuarter port), `status.ts` (statusFunc exact port + buildRoomTables + scheduleStatusBadge + no-faculty sentinels), `serialize.ts` (Prisma→DTO), `api.ts` (envelope {data}/{error,fields}, guard with deleted-user check, ci fallback lookups), `schemas.ts` (zod for every input), `csv.ts` (RFC4180 parser/writer).
- `src/middleware.ts`: /admin|/faculty|/student role guards (401→/login/<role>, wrong role→own dashboard), /login/* + /register/* bounce logged-in users. Matcher config included.
- API routes (all zod-validated, generic error envelope, no user enumeration): auth login/logout/register/{student,faculty,admin}; crud faculty/blocks/subjects/rooms/schedules/roster (GET/POST/PUT-by-body.id/DELETE-?id=); heartbeat (GET, faculty-only, updates lastHeartbeat); export/schedules (text/csv, CRLF, quoted); import/roster (multipart, header name,block, per-row report).

**Verification (R3/R8):**
1. **Logic harness** (temp prisma/check-logic.ts, deleted): 27/27 PASS — getQuarter all 3 mappings; Manila wall-clock conversion; statusFunc VACANT/UNAVAILABLE/ACTIVE/INACTIVE/NO_FACULTY incl. strict start/end inequalities, 900-min boundary (exact `>900`), null-heartbeat fallback, day-count arithmetic; buildRoomTables grouping+sort; CSV roundtrip (quotes, embedded comma/newline, CRLF).
2. **Live API smoke test** (dev server :3100, temp PowerShell scripts, deleted): login 200 + HttpOnly/SameSite=Lax/Max-Age 604800 cookie; JWT payload {sub:"1",role:"ADMIN",name:"admin"}; unauth CRUD 401; faculty on admin CRUD 403; admin on heartbeat 403; middleware /admin unauth→307 /login/admin, faculty→307 /faculty, admin→200; schedules list 36 with no-faculty sentinel row (facultyId 0, facultyName "None"); export CSV correct columns/quotes; CRUD room create/duplicate-409/PUT/delete; schedule create FK validation (400 fields.blockId) + valid create with facultyId 0; subject validation 400 fields; roster import {created:1,skipped:1,errors:["row 4: unknown block"]}; registration gates: roster name miss 404, duplicate 409, faculty-with-account 409, admin-unknown-name 404, strict block mismatch 400 fields.block, strict block match 200, FR-005 activation 200 + duplicate 409, admin cap 409 "Cannot register. Maximum admin accounts reached."; wrong-role login attempt → generic 401 "Invalid credentials"; logout destroys cookie (refreshed jar → 401).
3. DB reseeded to pristine seed state after testing (17 users, 17 faculty, 8 blocks, 28 subjects, 13 rooms, 36 schedules, 6 roster entries).

**Problems hit & resolved:**
1. Logic harness: imported manilaTimeOfDay from wrong module → fixed import.
2. Three harness failures were TEST-EXPECTATION bugs, not code bugs (day arithmetic off-by-one; assumed "Unavailable N min" for 901 min — legacy actually renders hr(s) because its `minutes<=60` sub-branch is dead code (days==0 ∧ >900 ∧ ≤60 is contradictory); assumed 45-min gap → Unavailable, legacy falls through to window check). Code port is legacy-exact; expectations corrected.
3. **Real bug found & fixed by smoke test:** faculty DELETE passed the zod safeParse result object instead of `id.data` to `prisma.facultyProfile.delete()` → 500 "Expected Int, provided Object". Fixed; delete verified working.
4. Curl inline JSON broke under PowerShell quoting repeatedly → switched to temp .ps1 script files + `--data-binary @file`.
5. First build attempt failed ONLY in frontend-owned files (src/app/admin/schedules/page.tsx importing DayCode from @/components/mocks — frozen contract places it in @/lib/types). Broadcast to team; frontend to fix; backend compiled clean ("Compiled successfully in 19.7s").
6. Note: register/admin under a faculty name is blocked with 409 when that name already has ANY account (unique username across roles — unified User table replaces legacy separate admin_register/faculty password columns). Admin cap still enforced (409 at 4th admin, legacy message).

---

## 2026-10-14 — Schema finalized, .env, migration + seed

**What:**
- `code/.env` created (gitignored; verified `.gitignore` line 4 covers `.env`): `DATABASE_URL="file:./dev.db"`, `AUTH_SECRET` = 64 random hex chars (RNG via `System.Security.Cryptography`). Written with `[System.IO.File]::WriteAllText` + UTF8-no-BOM (per PowerShell 5.1 BOM gotcha).
- `prisma/schema.prisma` finalized (details in Design decisions 1–2 above).
- `G:\npx.cmd prisma migrate dev --name init` → migration `20261014015501_init` created & applied; Prisma Client v6.19.3 regenerated. Evidence: migrate-out.log ("Your database is now in sync with your schema.").
- `G:\npx.cmd prisma db seed` → **Seed complete: 17 users, 17 faculty, 8 blocks, 28 subjects, 13 rooms, 36 schedules, 6 roster entries.** Evidence: seed-out.log.
- Data verification (temporary `prisma/check-seed.ts`, deleted after): 1 no-faculty schedule (BEED 3 @ room 'none', MWF 12:01–14:00 — legacy row 49) ✓; users ADMIN=1 FACULTY=16 ✓; legacy `$2y$` hash ported verbatim for Gerardo Ribon ✓; dev password `faculty123` verifies for passwordless faculty ✓; `admin123` verifies for admin ✓; 0 SAT/SUN schedules (matches dump) ✓; 6 roster entries with null block ✓; 5 schedules in 'BTLED' block ✓; heartbeats stored as Manila-wall-clock instants (2023-09-27T06:44:53Z = 14:44:53+08:00) ✓.

**Problems hit & resolved:**
1. `prisma migrate dev` also auto-ran the seed (package.json `prisma.seed`): esbuild `Transform failed ... seed.ts:33:33: Unexpected "="` — the first editor write of seed.ts was silently truncated mid-type-definition. Fixed by completing the `FacultySeed` type. Migration itself applied fine.
2. Second seed attempt failed: `seed.ts:118:5: Expected "]" but found "SchedSeed"` — an insert had landed inside `subjectsSeed`, dropping its last entry + closing bracket. Fixed by restoring `"Methods of Research", ];`.
3. Third attempt failed: `seed.ts:287:0: Unexpected "]"` — stale duplicate fragments left at EOF by the earlier truncated writes. Removed lines 286–294.
4. Fourth attempt: **seed succeeded** (counts above).

---

## 2026-10-14 — Final state & handoff

**Deliverables:** all 12 backend deliverables complete. Files: `prisma/schema.prisma` + `prisma/migrations/20261014015501_init/` + `prisma/seed.ts` + `prisma/dev.db`; `.env` (gitignored, 64-hex AUTH_SECRET); `src/lib/{types,session,auth,semester,status,serialize,api,schemas,csv,db}.ts`; `src/middleware.ts`; 14 API route files (`src/app/api/auth/{login,logout,register/{student,faculty,admin}}`, `src/app/api/crud/{faculty,blocks,subjects,rooms,schedules,roster}`, `src/app/api/heartbeat`, `src/app/api/export/schedules`, `src/app/api/import/roster`); `docs/API-CONTRACT.md`; `docs/DATA-MODEL.md`; this log. DB reseeded to pristine seed state after testing.

**Build gate evidence (fresh, final):**
- Backend type-checks with **0 errors**: `G:\npx.cmd tsc --noEmit` (code/tsc-out.log) → all 20 errors are in frontend-owned files only (`src/components/**`, `src/app/{admin,login,register}` pages).
- `G:\npm.cmd run build` (code/build2-err.log): webpack compile succeeds ("Compiled successfully" in the earlier run; compile phase clean again in final run) but **type-check fails on frontend files only** — first error `src/app/admin/schedules/page.tsx(4,26): '"@/components/mocks"' has no exported member named 'DayCode'`. Zero backend involvement.

**Cross-boundary blocker (R4, escalated to Leader twice — see mailbox):** the frontend agent's run (`run_00002`/task_0002) **FAILED** at 02:06:22Z ("Response stream ended without a finish reason" — team_list_runs evidence), leaving its files mid-work. Root cause of all 20 errors: shared types (`DayCode`, `Role`, `Semester`, DTOs) imported from `@/components/mocks` instead of `@/lib/types` (frozen contract), plus missing `buildUtilizationView`/`UtilizationTable` exports and 3 implicit-any sites. Precise fix list sent to Leader (mailbox msg_00004/00005). Frontend workstream needs a re-spawn by the Leader; once its files type-check, `G:\npm.cmd run build` should pass — backend contributes nothing blocking.

**Handoff notes for integration/re-spawned frontend:**
- Utilization pages: use `db` + `serialize.ts` mappers + `buildRoomTables()` + `scheduleStatusBadge()` from `@/lib/status`; filter schedules by `getQuarter()` for the current-semester view.
- No-faculty schedules: `facultyId: 0`, `facultyName: "None"` (sentinel; see API-CONTRACT.md). Roster without block: `blockId: 0`, `blockName: ""`.
- Seed dev credentials: admin `admin`/`admin123`; passwordless faculty `faculty123` (faculty username = faculty name); legacy-hash faculty keep their original legacy passwords.
- `.env` is present and gitignored; `.env.example` documents both variables (NFR-003).


## 2026-10-14 — Security fix pass (Phase 5 remediation, FIND-001/002/003/004/006/007/008 + Legal C1)

**Trigger:** Frontend agent reported build green + sent the security-fix task. Read docs/SECURITY-ASSESSMENT.md (findings + remediations), docs/LEGAL-COMPLIANCE-REVIEW.md (C1), docs/LICENSE-AUDIT.md (section 6 content list) first.

**Fixes implemented (all in backend ownership):**
1. **FIND-003 (Medium, CSV formula injection):** `src/lib/csv.ts` `toCsv()` now prefixes a single quote to any cell whose first char is `= + - @ \t \r` (per assessment remediation); RFC4180 quoting unchanged. Regression verified end-to-end: created subject `=cmd|'' /C calc''!A1`, attached to a temp schedule, exported - cell renders as `"''=cmd|'' /C calc''!A1"` (quote-prefixed, quoting intact); temp rows deleted after.
2. **FIND-004 (Medium, security headers):** `next.config.ts` (ownership assigned to me) `headers()` on all routes: X-Frame-Options DENY, XCTO nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy camera=()/microphone=()/geolocation=(), CSP `default-src ''self''; script-src ''self'' ''unsafe-inline''; style-src ''self'' ''unsafe-inline''; img-src ''self'' data:; font-src ''self'' data:; connect-src ''self''; frame-ancestors ''none''; object-src ''none''; base-uri ''self''; form-action ''self''`. CSP choices documented: ''unsafe-inline'' scripts required by Next.js inline bootstrap/flight scripts + the static pre-hydration theme script (nonce plumbing deferred as future hardening); ''unsafe-inline'' styles required by Tailwind/Next inline <style>. **HSTS intentionally omitted** (no HTTPS in dev; TLS-layer deployment concern, noted in README-SECURITY.md). Verified live: all 5 headers present on GET /.
3. **FIND-001 (Medium, login rate limiting):** new `src/lib/rate-limit.ts` - in-memory sliding 15-min window, counts FAILED logins per username+client-IP (first x-forwarded-for hop / x-real-ip / "unknown"), >10 failures -> 429 `{"error":"Too many failed attempts. Try again later."}` + `Retry-After: 900`; success resets. **Per-process (single-node) scope documented** in code comment, API-CONTRACT.md, here. Verified live: 11 consecutive bad logins -> 401 x11 then 429 from the 12th; blocked persists for any password until window expiry.
4. **FIND-006 (Low, CSRF hardening):** `src/lib/api.ts` `checkOrigin(req)` - rejects `Sec-Fetch-Site: cross-site` (403) and Origin-with-host-mismatch (403); no-Origin clients (curl/server-to-server) allowed; SameSite=Lax cookie remains primary defense. Wired into ALL POST/PUT/DELETE handlers (login, logout, 3 registrations, 6 CRUD routes x3 handlers, import). Verified live: login with `Origin: http://evil.example` -> 403 `Cross-origin request rejected`; matching Origin -> 200.
5. **FIND-007 (Low, admin-cap TOCTOU):** `register/admin` now runs the cap re-check + user creation inside one interactive `db.$transaction` (SQLite serializes writers -> race closed); Prisma P2002 (concurrent username collision) mapped to 409. Cap behavior re-verified earlier (409 + legacy message).
6. **FIND-008 (Informational, id range):** `idSchema` = coerce int positive **lte 2147483647** (Prisma Int is 32-bit on SQLite). Verified live: `?id=99999999999` and `?id=9223372036854775807` -> 400 (previously 500).
7. **FIND-002 (Critical, deployment gate - documentation + seed hardening):** created `code/README-SECURITY.md` (dev credentials table incl. the 6 un-rotatable legacy-hash accounts, MUST-rotate-before-non-localhost gate, loopback-binding guidance, reseed command, controls summary); `.env.example` now references it and documents `SEED_ADMIN_PASSWORD`/`SEED_FACULTY_PASSWORD`; `prisma/seed.ts` **refuses default dev passwords when NODE_ENV=production** unless those env overrides are set (assessment remediation step 1). Dev behavior unchanged (reseed verified identical counts).
8. **Legal C1:** generated `code/THIRD-PARTY-NOTICES.md` (118 KB, 2260 lines) by script from the ACTUAL installed `node_modules` LICENSE files: all 17 direct deps verbatim + caniuse-lite (CC-BY-4.0 attribution line), lightningcss (MPL-2.0), @swc/helpers + detect-libc + sharp (Apache-2.0), bcryptjs dual-notice note. Content list matches LICENSE-AUDIT.md section 6.1. Generator script was temp and deleted.

**Verification (R8):**
- `G:\npm.cmd run build` -> **success** ("Compiled successfully in 11.0s", 18/18 pages, all API routes + middleware in route table; evidence: build3-out.log). Frontend type fixes + this pass compile together.
- Focused smoke (dev :3100, temp scripts deleted): headers on / (5/5 present); hostile-Origin login 403; matching-Origin login 200; int32-range ids 400/400; CSV formula escape end-to-end as above; rate limit 401x11 -> 429 (and 429 with arbitrary password while locked).
- DB **reseeded to pristine state after testing**: `Seed complete: 17 users, 17 faculty, 8 blocks, 28 subjects, 13 rooms, 36 schedules, 6 roster entries.` (seed3-out.log). Note: SQLite AUTOINCREMENT continues after reseed (row ids drift upward, e.g. admin id 45) - counts are the canonical pristine check, not ids.

**Problems hit & resolved:**
1. First smoke of the CSV escape came back empty - schedule create had failed on a STALE hardcoded roomId=2 (ids drift after reseed due to AUTOINCREMENT). Redone with dynamically-looked-up FK ids -> passed. Lesson: never hardcode row ids across reseeds in tests.
2. PowerShell 5.1 read the notices-generator .ps1 as ANSI (em-dashes mangled -> parse errors) and backticks in double-quoted strings are escapes - rewrote ASCII-only with single-quoted strings; regenerated successfully.
3. findUserByUsername ci-fallback remains O(n) per login (fine at this scale); rate limiter is intentionally per-process (documented).

**Findings status for pentest re-verification:**
- FIND-001: FIXED (rate limiter, live-verified)
- FIND-002: MITIGATED (documentation gate README-SECURITY.md + production seed refusal + env overrides; credential rotation remains an operational step before any non-localhost deployment)
- FIND-003: FIXED (toCsv neutralization, live-verified end-to-end)
- FIND-004: FIXED (headers() live-verified; HSTS = deployment layer)
- FIND-006: FIXED (Origin/Sec-Fetch-Site on all mutating routes, live-verified)
- FIND-007: FIXED ($transaction cap, static)
- FIND-008: FIXED (int32 id validation, live-verified)
- FIND-005 (Low, enumeration - partly by-design): NOT in my tasking; rate limiter reduces probing; optional dummy-bcrypt timing equalization left as scheduled hardening.
- FIND-009 (days[] unbounded), FIND-010 (sequential import): NOT in my tasking (Informational); unchanged.
- Legal C1: DONE (THIRD-PARTY-NOTICES.md). C2/C3-C8 remain operational/DPO items per LEGAL-COMPLIANCE-REVIEW.md.
