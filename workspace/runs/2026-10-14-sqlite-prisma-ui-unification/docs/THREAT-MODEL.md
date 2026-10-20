# THREAT-MODEL — Classroom Utilization Management System 2.0 (Next.js + Prisma + SQLite)

_Run: 2026-10-14-sqlite-prisma-ui-unification · Author: pentest agent · Scope: the NEW app in `code/` only (legacy PHP tree is out of scope except as the defect baseline that must not recur) · Method: STRIDE per trust boundary + authn/authz matrix, verified statically and against the live dev server (see SECURITY-ASSESSMENT.md for test evidence)._

## 1. Assets (what an attacker wants)

| # | Asset | Location / form | Impact of compromise |
| :-- | :--- | :--- | :--- |
| A1 | User credentials (password hashes) | `User.passwordHash` in `prisma/dev.db` (SQLite), bcrypt cost 10; 6 legacy `$2y$` hashes ported verbatim | Offline cracking → account takeover of any role |
| A2 | Session token | `rsu_session` cookie — JWT HS256, payload `{sub, role, name}`, 7 d expiry, httpOnly, SameSite=Lax, Secure only in production | Session hijack → full account impersonation for up to 7 d (no server-side revocation) |
| A3 | `AUTH_SECRET` | `.env` (gitignored), 64-hex, ≥32 chars enforced at runtime | Forge arbitrary JWTs = total auth bypass |
| A4 | SQLite database file | `prisma/dev.db` (not web-served; verified `GET /prisma/dev.db → 404`) | Full data theft/tamper if host is compromised |
| A5 | Roster PII | `RosterEntry` (student names), `FacultyProfile` (names, ranks, advisory), heartbeats | Privacy exposure (RA 10173 relevance — see Legal workstream); presence-pattern inference |
| A6 | Schedules (integrity) | `Schedule` + FK tables (blocks/subjects/rooms) | Wrong room-occupancy info → operational disruption |
| A7 | Admin capability | Any ADMIN account (max 3, registration gated) | Full CRUD, roster import, CSV export, account creation |
| A8 | Availability | Single SQLite file, Node server, 2 MB import cap | Lock/bloat/crash of the utilization view |

## 2. Actors

| Actor | Description | Privileges |
| :--- | :--- | :--- |
| Anonymous | Any unauthenticated client (LAN or localhost — dev server binds `0.0.0.0`, verified banner `Network: http://192.168.1.251:3000`) | Landing, login pages, registration endpoints (gated), login API |
| Student | Registered via roster gate (name ∈ RosterEntry; block must match when recorded) | Own session; read-only utilization page; NO admin APIs (403), NO heartbeat (403) |
| Faculty | Registered/seeded faculty account linked 1:1 to `FacultyProfile` | Own utilization page + own heartbeat (`lastHeartbeat` self-mutation only); NO admin APIs (403) |
| Admin | ≤3 accounts; registration requires name ∈ faculty records and cap < 3 | All CRUD, CSV import/export, faculty-account deletion |
| Malicious roster/CSV supplier | Anyone able to hand a CSV file to an admin (e.g., a "roster template") | Influences imported `RosterEntry.name` content (stored; rendered as text; does NOT reach CSV export columns) |
| Same-site subdomain attacker | Controls another app on the same registrable domain | Can send SameSite=Lax cookies (site-scoped) — mitigated in deployment by keeping the app on its own host |

## 3. Trust boundaries & data flow

```
Browser (React UI, dark/light tokens)
   |  HTTP(S), cookies (rsu_session), same-origin fetch
   v
[TB1] middleware.ts (edge) — page-path guards: /admin/* -> ADMIN, /faculty/* -> FACULTY, /student/* -> STUDENT;
      unauth -> /login/<role>; wrong role -> own dashboard; logged-in on /login,/register -> own dashboard
   v
Next.js server (route handlers + server components)
   |
   +--[TB2] API layer /api/** — per-route guard(): JWT verify (jose HS256, exp enforced) + user-still-exists
   |        DB check + role allow-list -> 401/403; zod validation of every body/query (TB2a)
   v
[TB3] Prisma Client — parameterized query builder ONLY (no $queryRaw/$executeRaw anywhere in src/; grep-verified)
   v
SQLite prisma/dev.db (file, FK-enforced)
```

**Boundary notes**
- **TB1 (browser → middleware):** the middleware is the only thing standing between an anonymous browser and *page shells*; its bypass surface (CVE-2025-29927-style `x-middleware-subrequest`) was probed live and is patched in the installed next@15.5.27 (all four header variants → 307 to login).
- **TB2 (network → API):** every state-changing or sensitive API route self-guards — middleware deliberately does NOT match `/api/**`; the API layer never trusts the page guard. `guard()` additionally re-checks that the JWT `sub` still exists in `User` (deleted accounts are locked out immediately even with a valid token).
- **TB2a (input → domain):** all bodies go through zod (`src/lib/schemas.ts`); unknown fields are stripped (verified: extra `role`/`passwordHash`/`id` on room POST are ignored); query `id` must be a positive integer.
- **TB3 (app → DB):** Prisma parameterization eliminates the legacy SQLi class (the legacy app's SQL-interpolation defects per EXISTING-PROJECT-ANALYSIS §5 are structurally impossible here — no raw SQL construct exists in the codebase).
- **Not a boundary:** client-side React state — no authorization decision is ever made in the client; all checks re-run server-side.

## 4. STRIDE per boundary

### TB1 — Browser → middleware (page shells)
| Threat | Assessment |
| :--- | :--- |
| **S**poofing | JWT HS256 with server-secret; tamper/flawed-alg/forged-secret/expired tokens all rejected live (401 / redirect). jose does not accept `alg:none` with a key; HS-family pinned by key type at verify. |
| **T**ampering | Payload flip (role ADMIN→FACULTY, signature kept) → 401. Middleware re-derives role from the signed token only. |
| **R**epudiation | No audit log exists (any role). Accepted for this app class; noted as residual gap. |
| **I**nformation disclosure | Middleware redirect targets leak only role-path topology (`/login/<role>`), already public. |
| **D**enial of service | JWT verify is CPU-cheap (HMAC); no DB hit in middleware. |
| **E**levation | Role is read from the signed token, never from client input. Wrong-role access → own dashboard (verified for student→/admin,/faculty and admin→/faculty). |

### TB2 — Network → API routes
| Threat | Assessment |
| :--- | :--- |
| **S**poofing | `guard()` = verify JWT + user-exists + role ∈ allow-list. Verified: no cookie → 401; student cookie on admin CRUD/export/import → 403; admin cap respected. |
| **T**ampering | zod on every body/query; `id` coercion to positive int; HH:MM regex; FK existence re-checked server-side (bad FK ids → 400 with field errors). Extra fields stripped (mass-assignment safe). |
| **R**epudiation | Same as TB1 — console-only logging, no audit trail. |
| **I**nformation disclosure | Error envelope `{error, fields?}`; 500 = generic `"Internal server error"`; stack traces only reach the server console (verified: Prisma overflow error surfaced as JSON 500, detail only in dev log). Login failures are uniform `"Invalid credentials"` (no enumeration) — including valid-credentials-wrong-role. Login timing differs (~85 ms bcrypt path vs ~30 ms miss) — Low finding. |
| **D**enial of service | 2 MB import cap; body size effectively bounded only by zod limits (5 MB body parsed then rejected in 134 ms — no crash); `days[]` unbounded (5000 entries accepted) — Informational findings. Import is sequential (60 k rows = minutes) — admin-only. |
| **E**levation | Admin-only mutations enforced per route (14/14 routes reviewed: all guard first). IDOR attempts by student (GET/POST/PUT/DELETE on faculty/roster/export/heartbeat) → 403 across the board. Admin-cap TOCTOU race (count-then-create) can exceed 3 admins under concurrent registration — static finding, Low. |

### TB3 — App → Prisma → SQLite
| Threat | Assessment |
| :--- | :--- |
| **S**poofing | n/a (in-process). |
| **T**ampering | All writes via Prisma parameterized client; FK constraints + cascade/SetNull rules per schema. No raw SQL anywhere (grep-verified; NFR-002 PASS). |
| **R**epudiation | No DB-level audit; deleteMany+create seed is the only bulk writer. |
| **I**nformation disclosure | DB file not web-served (404 verified). Password hashes never serialized (DTOs omit `passwordHash` — verified in login response). CSV export quotes/escapes correctly but does not neutralize formula prefixes (CWE-1236, finding). |
| **D**enial of service | Single-writer SQLite; killed mid-import left partial rows (recovered by idempotent reseed) — no durable corruption observed. |
| **E**levation | Prisma has no privilege escalation surface beyond the app's own queries. |

## 5. Authn / authz matrix (implemented behavior — all rows live-verified unless marked)

| Endpoint | Anonymous | Student | Faculty | Admin | Verified |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /` (landing) | 200 | 200 | 200 | 200 | yes (page compiles) |
| `GET /login/<role>, /register/<role>` | 200 | 307 → `/student` | 307 → `/faculty` | 307 → `/admin` | yes |
| `GET /admin, /admin/*` | 307 → `/login/admin` | 307 → `/student` | 307 → `/faculty` (wrong-role rule) | 200 | yes |
| `GET /faculty` | 307 → `/login/faculty` | 307 → `/student` | 200 | 307 → `/admin` | yes |
| `GET /student` | 307 → `/login/student` | 200 | (mirror of wrong-role rule) | (mirror) | student+admin rows live; faculty row UNTESTED-live (same code path as admin row) |
| `POST /api/auth/login` | 200 on valid creds; 401 generic otherwise (wrong pw / wrong role / unknown user all identical) | same | same | same | yes |
| `POST /api/auth/logout` | 200, clears cookie | same | same | same | yes (old token still valid after logout — accepted design, see §6) |
| `POST /api/auth/register/student` | 404 roster-miss / 400 block-mismatch / 409 duplicate / 200 ok | same (gates are account-independent) | same | same | yes |
| `POST /api/auth/register/faculty` | 404 no profile / 409 has-account or name-taken / 200 ok | — | — | — | yes (409 paths live; 200 path exercised in backend smoke tests, not repeated here) |
| `POST /api/auth/register/admin` | 404 not-faculty / **409 cap at 3** / 409 name-taken / 200 ok | — | — | — | yes (cap 409 verified live) |
| `/api/crud/{entity}` GET/POST/PUT/DELETE | 401 | 403 | 403 | 200/400/404/409 | yes (student row fully probed across 8 verb/entity pairs; faculty row probed on rooms POST + export) |
| `GET /api/heartbeat` | 401 | 403 | 200 (mutates own row) | 403 | yes (student+faculty rows live) |
| `GET /api/export/schedules` | 401 | 403 | 403 | 200 `text/csv` | yes (all four roles live) |
| `POST /api/import/roster` | 401 | 403 | (403 — same single `guard("ADMIN")` call in code) | 200/400 | anonymous+admin live; student/faculty rely on the shared guard (student probe on sibling admin routes all 403) |

## 6. Accepted risks & residual threats (explicit, not scored findings)

1. **Stateless JWT survives logout (7 d).** ARCHITECTURE §4.3 accepts cookie-destruction logout for this app class. A stolen token remains valid after the victim logs out (live-confirmed: old token → 200 post-logout). Compensations: httpOnly cookie, SameSite=Lax, user-existence re-check (deleted accounts die immediately), 7 d expiry. Recommendation if the threat model hardens: server-side denylist or short-lived tokens + refresh.
2. **`Secure` cookie flag is environment-gated** (`NODE_ENV === "production"`). In the tested dev configuration the cookie is set without `Secure` over HTTP on `0.0.0.0:3000`. Production build could not be exercised (blocked by the frontend workstream's TS errors) — UNTESTED in production mode.
3. **No audit trail** for admin mutations — repudiation disputes cannot be resolved.
4. **Legacy `$2y$` bcrypt hashes** remain valid for 6 faculty accounts; their plaintext strength is unknown (inherited from the legacy dump). UNTESTED: live verification of a legacy password (plaintext unavailable to testers).
5. **Dev seed defaults** (`admin`/`admin123`, `faculty123` for 10 accounts) are intentional dev conveniences documented in DATA-MODEL.md — but they are live credentials in the tested configuration (LAN-reachable). Scored as FIND-002 in SECURITY-ASSESSMENT.md.
6. **Same-site subdomain attacker**: SameSite=Lax cookies attach to same-site requests; deployment must keep the app on a dedicated host (no untrusted sibling subdomains) — operational note, no code change available.
7. **Toolchain advisories** (npm audit: 4 high/1 moderate) sit in build-time dependencies (`postcss` ≤ 8.5.22 via next; `deepmerge-ts` via prisma CLI) — not in the app's request path; see SECURITY-ASSESSMENT.md §Dependencies.
8. **CSRF posture (stated, not invented):** all state-changing endpoints are POST/PUT/DELETE and the session cookie is SameSite=Lax, which modern browsers do not attach to cross-site POSTs — the realistic CSRF class (cross-site form/fetch POST with cookies) is therefore blocked in current browsers. No Origin/Sec-Fetch-Site validation exists server-side (defense-in-depth gap; a same-site subdomain attacker or a non-SameSite-aware browser would bypass). The only state-mutating GET is `/api/heartbeat`, which top-level cross-site navigations DO carry the cookie for — impact is limited to falsifying the victim's own presence timestamp (negligible). Verdict: adequate for this app class; hardening recommendations in SECURITY-ASSESSMENT.md FIND-006.


