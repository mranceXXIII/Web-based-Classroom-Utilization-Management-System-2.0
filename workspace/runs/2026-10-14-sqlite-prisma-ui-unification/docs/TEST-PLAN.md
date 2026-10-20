# TEST-PLAN — Classroom Utilization Management System 2.0

_Run: 2026-10-14-sqlite-prisma-ui-unification · Owner: QA (task_0005) · Target: `code/` Next.js 15 App Router + Prisma 6 + SQLite · Traceability targets: REQUIREMENTS.md FR-001..034 + NFR-001..006._

## 1. Method & environment

- **Dynamic tests** drive the app over HTTP at `http://localhost:3100` (dev server started by QA with `PORT=3100`): PowerShell `Invoke-WebRequest`/`Invoke-RestMethod` with a **`WebRequestSession` cookie jar per role** (admin/faculty/student). DOM-level assertions are made by **fetching rendered HTML** and asserting class/content presence — QA has no browser; click-through is out of scope and declared per-TC.
- **DB-state tests** (badge states, heartbeat, seed fidelity) use throwaway `tsx` scripts in `qa-tmp/` importing the app's Prisma client. State mutations are **always restored** afterwards.
- **Static tests** grep/read source + docs (token usage, SQL interpolation, secrets, NFR gates). Typecheck/build gates run the real commands (`G:\npx.cmd tsc --noEmit`, `G:\npm.cmd run build`) in `code/`.
- **Evidence:** every TC records command + observed result in `qa-tmp/*.log` or inline in TEST-REPORT.md (R3). Pass criterion per TC is stated explicitly.
- **Coordination gate:** dynamic execution starts only after PROGRESS-LOG-BACKEND.md contains the run_00006 "fix pass" section (backend security fixes incl. CSV formula-escaping on export). If the section is absent 30 min after plan completion, QA notes the deviation and tests anyway, re-verifying fix-dependent TCs if the pass lands later.

## 2. Test data policy

- Baseline = pristine seed: **17 users, 17 faculty profiles, 8 blocks, 28 subjects, 13 rooms, 36 schedules, 6 roster entries** (DATA-MODEL.md). Verified at TC-004 and re-verified at TC-070 (final reseed).
- All TC-created entities (users, schedules, roster rows, rooms, blocks, subjects, faculty) are **deleted by the TC itself** (by id) whenever the API allows; otherwise removed via `prisma db seed` reseed at TC-070. No test data may survive the run.

## 3. Suites & test cases

### Suite A — Static & build gates (NFR-001/002/003/005/006, FR-010, FR-011)

| TC | Req | Type | Steps | Expected / pass criterion |
| --- | --- | --- | --- | --- |
| TC-001 | NFR-001 | static cmd | `G:\npx.cmd tsc --noEmit` in `code/` | Exit 0, empty error log |
| TC-002 | NFR-001, Charter §3.1 | static cmd | `G:\npm.cmd run build` in `code/` (log to qa-tmp) | "Compiled successfully"; route table emitted; 0 TS errors |
| TC-003 | FR-010 | static + DB | Read `prisma/schema.prisma` (7 models, relations, unique fields); tsx script: verify `@unique`/`@@unique` via attempted duplicate inserts; verify FK enforcement | 7 models per DATA-MODEL.md; duplicates rejected; FK violations rejected by SQLite |
| TC-004 | FR-011 | DB | tsx script counts + spot rows | Counts exactly 17 users / 17 faculty / 8 blocks / 28 subjects / 13 rooms / 36 schedules / 6 roster; admin `admin` + Gerardo Ribon `$2y$` hash + 6 roster null blockId + 36 schedules '1st Sem' + heartbeats ported |
| TC-005 | NFR-002 | static grep | grep `src/` for `$queryRaw`/`$executeRaw`/`prisma.$queryRawUnsafe`/raw `SELECT…FROM` strings | No raw SQL anywhere; all data access via Prisma Client |
| TC-006 | NFR-003 | static | Read `.gitignore` + `.env.example`; grep `src/` for hardcoded secrets/passwords | `.env` gitignored; `.env.example` documents DATABASE_URL + AUTH_SECRET; no hardcoded credentials |
| TC-007 | NFR-005 | dynamic + static | Login → inspect `Set-Cookie` attrs; grep bcrypt cost; tsx `bcrypt.getRounds()` on a seeded hash | Cookie httpOnly + SameSite=Lax + Path=/ (+Secure in prod); cost ≥ 10 |
| TC-008 | NFR-006 | static grep | grep `src/` for `Asia/Manila` / timezone math outside `src/lib/status.ts` + `src/lib/semester.ts` | Timezone logic isolated in the two lib files |

### Suite B — Landing, auth, registration, guards (FR-001..007)

| TC | Req | Type | Steps | Expected |
| --- | --- | --- | --- | --- |
| TC-010 | FR-001 | DOM | GET `/` | 200; links/cards to `/login/admin`, `/login/faculty`, `/login/student` present |
| TC-011 | FR-002, FR-003 | API+DOM | POST `/api/auth/login` `{role:"ADMIN",username:"admin",password:"admin123"}`; capture Set-Cookie; GET `/admin` with cookie | 200 + `rsu_session` httpOnly cookie; UserDTO role ADMIN; /admin 200 (dashboard reachable) |
| TC-012 | FR-002, FR-003 | API+DOM | Pick passwordless faculty (dev password `faculty123`) from seed → POST login `{role:"FACULTY",username:"<Faculty Name>",password:"faculty123"}`; GET `/faculty` | 200 + cookie; username = faculty **name**; /faculty 200 |
| TC-013 | FR-002/003 | API | Fresh jars: (a) admin wrong password; (b) unknown username; (c) valid faculty creds posted with `role:"STUDENT"`; (d) student creds role ADMIN | All 401 `{error:"Invalid credentials"}` generic; role mismatch rejected; no user enumeration |
| TC-014 | FR-004 | API | POST `/api/auth/register/student`: (a) name not in roster → 404; (b) entry with recorded block + wrong block → 400 `fields.block` (TC-created roster entry w/ block, deleted after); (c) valid roster name → 200, then login role STUDENT works; (d) duplicate re-register → 409 | Gates per API-CONTRACT.md §Registration gates |
| TC-015 | FR-005 | API | POST `/api/auth/register/faculty`: (a) unknown name 404; (b) faculty with existing account → 409; (c) TC-created profile without user → 200 activates; (d) repeat → 409; login with chosen password works; cleanup | Activation only when profile exists && userId null |
| TC-016 | FR-006 | API | POST `/api/auth/register/admin`: (a) name not in faculty records → 404; (b) valid faculty name → 200 (admin #2); (c) second valid name → 200 (admin #3); (d) 4th attempt → 409 "Cannot register. Maximum admin accounts reached."; cleanup | Cap 3 enforced, legacy message |
| TC-017 | FR-007 | API | Fresh jar login → POST `/api/auth/logout` → observe clearing Set-Cookie → GET `/api/crud/rooms` with same jar | Logout 200; cookie cleared; next call 401 (session destroyed) |
| TC-018 | FR-007 | dynamic | No cookie: GET `/admin`,`/faculty`,`/student` → 307 to matching `/login/<role>`; faculty cookie → GET `/admin` 307 `/faculty`; student cookie → GET `/admin` 307 `/student`; admin cookie → GET `/student` 307 `/admin`; logged-in GET `/login/admin` → bounce | Role guards correct; no protected HTML leaks |
| TC-019 | FR-002 | DOM | After admin login, GET `/admin` HTML contains overview stat cards; faculty login → `/faculty` HTML contains semester title | Login lands in role dashboard (server-rendered proof) |

### Suite C — Admin CRUD over 6 entities (FR-012, FR-013, NFR-004)

All CRUD TCs run as **admin session** (cookie jar from TC-011) against `/api/crud/<entity>`; each TC also fetches the matching `/admin/<section>` page and asserts the new/edited/deleted value appears or disappears in rendered HTML (UI proof, not click-through). Duplicate-name checks use case-insensitive variants (legacy ci collation).

| TC | Req | Entity | Steps | Expected |
| --- | --- | --- | --- | --- |
| TC-030 | FR-012 | faculty | GET list (36→ includes seeded names); POST create (name + academicRank + advisory); duplicate name (ci variant) → 409; PUT update rank; DELETE by id → `{ok:true}`; re-GET | Full CRUD + ci-duplicate 409; list reflects changes |
| TC-031 | FR-012 | blocks | POST create (name, yearLevel); duplicate ci → 409; advisorId FK: nonexistent advisor id → 400 `fields`; PUT rename; DELETE (block without schedules so no cascade side-effects) | CRUD + 409 + FK validation |
| TC-032 | FR-012 | subjects | POST create description; duplicate → 409; PUT; DELETE | CRUD + 409 |
| TC-033 | FR-012 | rooms | POST create name; duplicate → 409; PUT; DELETE | CRUD + 409 |
| TC-034 | FR-013 | schedules | POST create: blockId/subjectId/roomId from seed, facultyId 0 (sentinel "None"), semester, HH:MM times, `days:["MON","WED","FRI"]` multi-select; FK validation: nonexistent blockId/subjectId/roomId → 400 `fields`; empty days → 400; GET list shows new row with joined names; PUT update (change days/times); DELETE; admin `/admin/schedules` HTML reflects create before delete | Create/read/update/delete + FK 400s + day multi-select stored (wire `DayCode[]`) + facultyId-0 sentinel `facultyName:"None"` |
| TC-035 | FR-012/014 | roster | POST create `{name}` (no block → blockId 0 sentinel); duplicate name+block → 409; PUT; DELETE; GET list; `/admin/roster` HTML shows row | CRUD + duplicate 409 + null-block sentinel |
| TC-036 | FR-007, API-CONTRACT | all | Fresh unauth jar: GET/POST/PUT/DELETE on each entity → 401; faculty session → 403; student session → 403 | Auth gate on every CRUD verb/role |
| TC-037 | NFR-004 | all | POST each entity with invalid/missing fields (empty name, bad email-like types, missing schedule times, short password on register) | 400 `{error, fields:{...}}` typed zod errors; never 500 for validation |

### Suite D — CSV export & roster import (FR-015, FR-014)

Export depends on the run_00006 fix pass (formula-escaping per FIND-003); if the pass has not landed when TC-041 executes, mark TC-041 **FAIL/BLOCKED-defect** against backend and re-verify after the pass.

| TC | Req | Steps | Expected |
| --- | --- | --- | --- |
| TC-040 | FR-015 | Admin jar GET `/api/export/schedules`; save to qa-tmp; parse raw bytes | 200; `Content-Type: text/csv; charset=utf-8`; `Content-Disposition: attachment; filename="schedules.csv"`; CRLF line endings; header `id,faculty,block,subject,room,days,start,end,semester`; 36 data rows matching DB |
| TC-041 | FR-015, FIND-003 | Create schedule whose subject/block/faculty name begins with `=`, `+`, `-`, `@` (e.g. subject "=SUM(A1)") → export → inspect escaping → delete schedule | Formula-triggering leading chars are escaped/prefixed per fix-pass spec (no raw `=`,`+`,`-`,`@` at unquoted-field start); quoted fields RFC4180 (`""` doubling) |
| TC-042 | FR-015, RFC4180 | Inspect export for embedded commas/quotes in seeded names (e.g. 'Combined BSED 3  SCIENCE and MATHEMATICS' has double space; any name with comma → `"...","..."` quoting) | RFC4180: fields with special chars quoted; embedded `"` doubled |
| TC-043 | FR-014 | Admin POST `/api/import/roster` multipart with valid CSV (3 new names, one duplicate of existing roster row, one unknown block) | 200 `{created:3, updated:1, skipped:…, errors:["row N: unknown block …"]}`; GET `/api/crud/roster` reflects rows; roster page HTML shows them |
| TC-044 | FR-014 | Import edge cases: (a) no file → 400; (b) wrong header (no `name,block`) → 400; (c) row missing name → per-row error; (d) empty block column → created with no block (blockId 0) | 400s with typed envelope; per-row errors listed; empty block → null sentinel |
| TC-045 | FR-014 | Import >2 MB CSV | 400 (too large) — may be BLOCKED if generating a >2MB multipart is impractical; declare honestly |

### Suite E — Utilization views, badges, heartbeat, semester (FR-020..023, NFR-006)

Badge-state driving (TC-051) uses a qa-tmp tsx script: pick one schedule row, mutate its faculty's `lastHeartbeat` and the row's start/end times to force each state, re-render the faculty page HTML, assert the badge label+color class, **restore original values** in the same script. Unit-level boundary checks (TC-055) call the real `statusFunc`/`getQuarter` from `@/lib` directly.

| TC | Req | Steps | Expected |
| --- | --- | --- | --- |
| TC-050 | FR-020 | Faculty jar GET `/faculty` HTML | 200; current semester label via `getQuarter()` (Oct → "1st Sem"); one table per room (13 rooms); schedule rows show day chips/times; no SAMPLE-data banner (real data) |
| TC-051 | FR-021 | Drive 5 states via tsx mutations + HTML re-fetch per state: (a) VACANT (heartbeat gap > 1 day — seeded 2023 heartbeats already give this); (b) UNAVAILABLE (gap 60–900 min today); (c) ACTIVE (now strictly between start/end + fresh heartbeat); (d) INACTIVE (outside window, fresh heartbeat); (e) NO_FACULTY (schedule with facultyId null → sentinel) | Exact legacy labels: "Vacant N day(s)", "Unavailable X hr(s)", "Active", "Inactive", "No Faculty"; badge color classes success/danger/info/muted per UI-SPEC §2 map |
| TC-052 | FR-022 | Faculty jar GET `/api/heartbeat`; read `FacultyProfile.lastHeartbeat` before/after via tsx; repeat → timestamp advances; admin jar GET same endpoint → 403; student jar → 403 | lastHeartbeat updates on each ping (60s cadence code-inspected in heartbeat.tsx); non-faculty rejected |
| TC-053 | FR-023 | Student jar GET `/student` HTML; compare vs `/faculty` | Same utilization tables/badges; NO heartbeat component; read-only |
| TC-054 | NFR-006, FR-020 | tsx harness calls `getQuarter()` with injected dates: months 8,12 → "1st Sem"; 1,5 → "2nd Sem"; 6,7 → "Vacation"; Manila boundary (Dec 31 16:30 UTC = Jan 1 00:30 Manila) | All mappings exact per FR-020 |
| TC-055 | NFR-006, FR-021 | tsx harness calls `statusFunc` with injected `now`: (a) gap exactly 900 min same day → not VACANT; (b) gap 901 min same day → "Unavailable … hr(s)"; (c) gap > 1 day → "Vacant N day(s)"; (d) now == startTime → "Inactive"; (e) now == endTime → "Inactive"; (f) between → "Active"; (g) null heartbeat → window fallback | Boundary behavior matches legacy HomeTableMainFunc.php:132-235 |

### Suite F — UI / design system (FR-030..034)

QA has no browser: theme **behavior** (TC-061) is verified by (a) pre-hydration script present in served HTML, (b) `theme-toggle.tsx` source writing `localStorage.theme` + toggling `document.documentElement.classList`, (c) `.dark` token re-mapping in `globals.css`. Click-simulation is declared not testable in this environment.

| TC | Req | Steps | Expected |
| --- | --- | --- | --- |
| TC-060 | FR-030, FR-031 | Grep `src/components/**` + `src/app/**` (excluding globals.css) for raw hex `#[0-9a-fA-F]{3,8}`, gradients, `bootstrap`, `jquery`, ticker/marquee, vendored assets | No raw hex outside token definitions; no gradients/tickers; no Bootstrap/jQuery/vendored assets; token classes used (`bg-surface`, `text-muted`, …) |
| TC-061 | FR-032 | GET `/` HTML: pre-hydration script setting html class from localStorage/system before paint; html tag default class present; theme-toggle source uses `localStorage` key `theme` + system preference; `.dark` token re-mapping in globals.css | Toggle persists (key `theme`); system default; no flash (pre-hydration script); both themes styled |
| TC-062 | FR-033 | Grep components for `hover:`/`focus-visible:`/`disabled:`/`ring-ring` classes; tsx contrast script computes WCAG ratios for `--text`/`--muted` vs `--bg`/`--surface` and `--accent-contrast` vs `--accent` in both themes from globals.css values | Interactive states defined in both themes; body-text contrast ≥ 4.5:1 both themes (AA) |
| TC-063 | FR-034 | Fetch `/faculty`, `/admin/schedules`, `/admin/roster` HTML; assert tables wrapped in `overflow-x-auto` (+ `min-w-[...]`) classes; admin nav horizontally scrollable at small widths | Tables scroll horizontally; layout survives 360px at CSS-class level (pixel testing declared out of environment scope) |
| TC-064 | FR-030, UI-SPEC | Spot-check uniformity: same button variants/classes across pages; consistent card/table/badge classes; icon-only buttons carry `aria-label`; inputs have label/htmlFor | Component shapes uniform; accessibility affordances present |

### Suite G — Data integrity & cleanup

| TC | Req | Steps | Expected |
| --- | --- | --- | --- |
| TC-070 | FR-011, briefing §4 | After all suites: `G:\npx.cmd prisma db seed` in `code/`; re-run the TC-004 count script | Reseed idempotent; final counts exactly 17 users / 17 faculty / 8 blocks / 28 subjects / 13 rooms / 36 schedules / 6 roster entries; no QA test data remains |

## 4. Traceability matrix (FR/NFR → TC)

| Req | TCs | | Req | TCs |
| --- | --- | --- | --- | --- |
| FR-001 | TC-010 | | FR-020 | TC-050, TC-054 |
| FR-002 | TC-011, TC-012, TC-013, TC-019 | | FR-021 | TC-051, TC-055 |
| FR-003 | TC-011, TC-012, TC-013, TC-014(c) | | FR-022 | TC-052 |
| FR-004 | TC-014 | | FR-023 | TC-053 |
| FR-005 | TC-015 | | FR-030 | TC-060, TC-064 |
| FR-006 | TC-016 | | FR-031 | TC-060 |
| FR-007 | TC-017, TC-018, TC-036 | | FR-032 | TC-061 |
| FR-010 | TC-003 | | FR-033 | TC-062 |
| FR-011 | TC-004, TC-070 | | FR-034 | TC-063 |
| FR-012 | TC-030..033, TC-035, TC-036, TC-037 | | NFR-001 | TC-001, TC-002 |
| FR-013 | TC-034, TC-037 | | NFR-002 | TC-005 |
| FR-014 | TC-043, TC-044, TC-045, TC-035 | | NFR-003 | TC-006 |
| FR-015 | TC-040, TC-041, TC-042 | | NFR-004 | TC-037 |
| | | | NFR-005 | TC-007 |
| | | | NFR-006 | TC-008, TC-054, TC-055 |

## 5. Known environment limitations (candidates for the "not testable" list)

1. **No browser** — real click-through of the theme toggle, dialogs, and 360px pixel rendering cannot be executed; DOM/CSS/source-level verification is used instead (declared per TC).
2. **Legacy faculty passwords** — the 6 seeded `$2y$` hashes preserve legacy passwords whose plaintext is unknown; login with those specific legacy credentials is untestable. The dev-password path (`faculty123`) is tested (TC-012).
3. **Production `Secure` cookie flag** — dev server only; verified by code inspection, not over HTTPS.
4. **TC-016 concurrent admin-cap race (FIND-007 TOCTOU)** — sequential cap enforcement tested; concurrent race out of scope (pentest already assessed statically).
5. **TC-045 >2 MB import** — attempted; may be environment-practicality BLOCKED, declared honestly.
