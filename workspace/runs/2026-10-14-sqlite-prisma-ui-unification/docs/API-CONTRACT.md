# API-CONTRACT — Backend Endpoints (implementation record)

_Run: 2026-10-14-sqlite-prisma-ui-unification · Owner: backend agent · Frozen shapes: docs/INTERFACE-TYPES.md_

## Envelope (all JSON endpoints)

- Success: `{ "data": T }` — HTTP 200 (200 even for create/update/delete; delete returns `{ "data": { "ok": true } }`).
- Error: `{ "error": string, "fields"?: Record<string,string> }` — HTTP 400/401/403/404/409/500.
- 400 with `fields` = zod validation failure (first message per field path).
- 401 unauthenticated (or JWT from a since-deleted user) / wrong-role login attempts and bad credentials share one generic message (`"Invalid credentials"` — no user enumeration).
- 403 authenticated but wrong role (also: cross-origin/cross-site state-changing requests rejected by the Origin/Sec-Fetch-Site check, see Security hardening). 404 not found. 409 conflict (duplicate/unique/cap). 429 too many failed login attempts (rate limit). 500 generic `"Internal server error"` (stack traces never leave the server).

## Auth & session

- Cookie: `rsu_session` — JWT HS256 via `jose`, payload `{sub, role, name}`, 7d expiry, httpOnly, SameSite=Lax, Secure in production, path `/`.
- Password hashing: bcryptjs cost 10 (verifies legacy `$2y$` hashes).
- Name matching: exact first, then case-insensitive (legacy MySQL `utf8mb4_general_ci` behavior).

| Method | Path | Auth | Request | Response (data) | Errors |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | — | `{role: "ADMIN"\|"FACULTY"\|"STUDENT", username, password}` | `{user: UserDTO}` + session cookie | 400, 401 generic, 500 |
| POST | `/api/auth/logout` | — | — | `{ok: true}` (clears cookie) | — |
| POST | `/api/auth/register/student` | — | `{name, block, password(≥6)}` | `{user: UserDTO}` | 400 block mismatch (`fields.block`), 404 name not in roster, 409 already registered, 500 |
| POST | `/api/auth/register/faculty` | — | `{name, password(≥6)}` | `{user: UserDTO}` | 404 faculty record not found, 409 already has account / username taken, 500 |
| POST | `/api/auth/register/admin` | — | `{name, password(≥6)}` | `{user: UserDTO}` | 404 name not in faculty records, 409 cap (`"Cannot register. Maximum admin accounts reached."`) or name taken, 500 |

**Registration gates (FR-004/005/006, legacy-cited):**
- Student: name must exist in `RosterEntry`; if the entry has a recorded block, the chosen block must match it; entries with **no** recorded block (all 6 legacy rows: `block=''`) accept any block — mirrors `student_register.php`, which verified the name only. Username = roster name; duplicate username → 409.
- Faculty: profile must exist and have no linked account (`userId == null`); creates the `User` (role FACULTY, username = profile name) and links it.
- Admin: name must exist in faculty records; `COUNT(users.role=ADMIN) < 3` enforced (legacy `admin_register` cap); username must be unused across all roles (unique `User.username`).

## CRUD — `/api/crud/{entity}` (admin-only; GET list, POST create, PUT update via `body.id`, DELETE via `?id=`)

| Entity | POST/PUT body | Notes |
| :--- | :--- | :--- |
| `faculty` | `{name, academicRank?, advisory?}` (defaults `"Not specified"`/`"None"`) | Unique name (ci). DELETE removes the linked `User` too; schedules survive with no faculty (`SetNull`). |
| `blocks` | `{name, yearLevel, advisorId?}` (`null` = no advisor) | Unique name (ci). advisorId must reference an existing faculty. DELETE cascades schedules + roster entries. |
| `subjects` | `{description}` | Unique. DELETE cascades its schedules. |
| `rooms` | `{name}` | Unique. DELETE cascades its schedules. |
| `schedules` | `{semester, startTime "HH:MM", endTime "HH:MM", days: DayCode[] (≥1), facultyId?, blockId, subjectId, roomId}` | `facultyId` absent/`null`/`0` → no faculty. FK ids validated → 400 `fields`. `days` stored comma-joined; wire format is `DayCode[]`. |
| `roster` | `{name, blockId?}` | `blockId` absent/`null`/`0` → no block recorded. Duplicate (name, blockId) → 409. |

- GET returns the entity's DTO array (`FacultyDTO[]`, `BlockDTO[]`, `SubjectDTO[]`, `RoomDTO[]`, `ScheduleDTO[]`, `RosterEntryDTO[]`) ordered by id ascending (schedules: semester, then startTime).
- All lists include the joined names (e.g. `advisorName`, `blockName`, `facultyName`).

## Heartbeat, export, import

| Method | Path | Auth | Request | Response | Errors |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/api/heartbeat` | FACULTY | — | `{lastHeartbeat: ISO-8601}` (updates `FacultyProfile.lastHeartbeat = now`) | 401/403, 404 no profile, 500 |
| GET | `/api/export/schedules` | ADMIN | — | `text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="schedules.csv"`, CRLF, all fields quoted. Columns: `id,faculty,block,subject,room,days,start,end,semester` | 401/403, 500 |
| POST | `/api/import/roster` | ADMIN | multipart/form-data, field `file` (CSV ≤ 2 MB), header row must contain `name,block` | `{created, updated, skipped, errors: string[]}` — per-row errors for missing name / unknown block | 400 (no file / bad header / too large), 401/403, 500 |

Import semantics: rows are upserted by (name, blockId). Empty block column → no block recorded. Unknown non-empty block names are rejected per row (no auto-creation). CSV parsing is RFC4180-style (quoted fields, `""` escapes, CRLF/LF).

## No-faculty wire sentinel (frozen-DTO convention)

`ScheduleDTO.facultyId` is typed `number` by the frozen contract. Schedules without a faculty row (legacy `table_sched` row 49, `faculty='None'`) serialize as **`facultyId: 0`, `facultyName: "None"`** (the literal legacy cell text). Status for such rows is `NO_FACULTY` / `"No Faculty"` regardless of times — use `scheduleStatusBadge()` from `@/lib/status` (handles the sentinel) or branch on `facultyId === 0`. `RosterEntryDTO` uses `blockId: 0`, `blockName: ""` for "no block recorded".

## statusFunc / getQuarter behavior (for the UI)

- `getQuarter(now?)`: Manila month 8–12 → `"1st Sem"`, 1–5 → `"2nd Sem"`, 6–7 → `"Vacation"`.
- `statusFunc({hasFaculty, lastHeartbeat, startTime, endTime}, now?)` (Asia/Manila, legacy-exact per `HomeTableMainFunc.php:132-235`):
  - no faculty → `NO_FACULTY "No Faculty"`
  - heartbeat gap ≥ 1 day → `VACANT "Vacant N day(s)"`
  - same calendar day, gap > 900 min → `UNAVAILABLE "Unavailable X hr(s)"` (the legacy `Unavailable N min` sub-branch exists but is unreachable — gap >900 ∧ ≤60 min is impossible; ported as-is)
  - else current Manila time **strictly** between start and end → `ACTIVE "Active"`, else `INACTIVE "Inactive"` (at exactly start/end → Inactive, matching legacy `$date1 > $date2 && $date1 < $date3`)
  - null heartbeat → falls back to the time-window check (ARCHITECTURE §6)
- `buildRoomTables(schedules)` → one `RoomWeeklyTable` per room, schedules sorted by startTime (legacy `ORDER BY Start_Time ASC`), rooms by id ascending.

## Static typing & imports

- Shared DTOs: `@/lib/types` (frozen, verbatim from INTERFACE-TYPES.md). Do **not** re-declare `DayCode`/`Role`/`Semester` elsewhere.
- DB access in server components: `import { db } from "@/lib/db"` + mappers from `@/lib/serialize`.
- Badge helper: `scheduleStatusBadge(schedule, heartbeatByFacultyId, now?)` from `@/lib/status`.

## Security hardening (Phase 5 remediation — SECURITY-ASSESSMENT.md FIND-001/003/004/006/007/008)

**Login rate limiting (FIND-001)** — `src/lib/rate-limit.ts`, wired into `POST /api/auth/login`:
- Sliding 15-minute window; counts **failed** logins per `username + client IP` (first `x-forwarded-for` hop, else `x-real-ip`, else `"unknown"`).
- After **10 failed attempts**, further attempts return **429** `{"error": "Too many failed attempts. Try again later."}` with `Retry-After: 900`; a successful login resets the counter for that username+IP.
- **Per-process, in-memory** (single Next.js node). Correct for the single-campus intranet deployment class; a multi-node deployment needs a shared store.

**Origin / Sec-Fetch-Site check (FIND-006, CSRF defense-in-depth)** — `src/lib/api.ts` `checkOrigin()`, applied to **all POST/PUT/DELETE** handlers (login, logout, all registrations, all CRUD, import):
- `Sec-Fetch-Site: cross-site` → 403.
- `Origin` present and its host ≠ request `Host` → 403 (invalid Origin → 403); no `Origin` (non-browser clients) → allowed.
- SameSite=Lax session cookie remains the primary CSRF defense.

**CSV formula-injection neutralization (FIND-003, CWE-1236)** — `src/lib/csv.ts` `toCsv()`: any exported cell whose first character is `=`, `+`, `-`, `@`, tab, or CR is prefixed with a single quote (verified end-to-end: hostile subject `=cmd|' /C calc'!A1` exports as `"'=cmd|' /C calc'!A1"`). RFC4180 quoting unchanged.

**Security headers (FIND-004)** — `next.config.ts` `headers()`, all routes: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, CSP `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'` (`'unsafe-inline'` required by Next.js inline bootstrap/flight scripts + the static pre-hydration theme script and Tailwind inline styles; nonce-based CSP deferred). **HSTS intentionally absent** — belongs at the TLS-terminating layer in production (no HTTPS in dev; see `code/README-SECURITY.md`).

**Integer-range validation (FIND-008)** — `?id=` (and PUT `body.id`) coerce+validate to a positive **int32** (`≤ 2147483647`); out-of-range values return 400, never a Prisma/SQLite 500.

**Admin-cap atomicity (FIND-007)** — `/api/auth/register/admin` performs the cap count + user creation inside one interactive `$transaction` (SQLite serializes writers, closing the TOCTOU race); concurrent username collisions surface as Prisma P2002 → 409.

**Deployment gate (FIND-002)** — see `code/README-SECURITY.md`: dev-seed credentials (`admin/admin123`, `faculty123`) MUST be rotated/removed before any non-localhost deployment; the seed refuses default credentials when `NODE_ENV=production` unless `SEED_ADMIN_PASSWORD`/`SEED_FACULTY_PASSWORD` are set; reseed command documented.