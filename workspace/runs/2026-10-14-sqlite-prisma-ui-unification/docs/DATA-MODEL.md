# DATA-MODEL — Prisma (SQLite) + legacy table mapping

_Run: 2026-10-14-sqlite-prisma-ui-unification · Owner: backend agent · Schema: `code/prisma/schema.prisma` · Migration: `prisma/migrations/20261014015501_init/`_

## Models (7 — normalized, FK-enforced; SQLite has no Prisma enums, so `role` is a validated string)

| Prisma model | Fields | Legacy source table | Mapping notes |
| :--- | :--- | :--- | :--- |
| `User` | `id, username @unique, passwordHash, role ("ADMIN"\|"FACULTY"\|"STUDENT"), createdAt` | `admin_register` + `student` + faculty login columns of `it_faculty` | One unified account table. Legacy `$2y$` bcrypt hashes ported verbatim (bcryptjs verifies them). Role is a plain string validated by zod (SQLite/Prisma = no enums). |
| `FacultyProfile` | `id, name @unique, academicRank, advisory, lastHeartbeat DateTime?, userId? @unique → User (SetNull)` | `it_faculty` (`Name`, `Academic_Rank`, `Advisory`, `timestamp` = heartbeat) | `lastHeartbeat` replaces the heartbeat timestamp column (legacy `UPDATE it_faculty SET timestamp=NOW()`). 1:1 optional link to `User` (legacy login was a nullable password column). |
| `Block` | `id, name @unique, yearLevel, advisorId? → FacultyProfile (SetNull)` | `blocks_detail` (`name`, `year_level`, `advisor`) | Legacy advisor was a free-text name (`'None'` in all rows); now a real FK, `null` when advisor is none/unmatched. |
| `Subject` | `id, description @unique` | `subject` (`subject_description`; `subject_code` dropped — unused by any consumer page in the legacy app) | |
| `Room` | `id, name @unique` | `rooms` (`room`) | 13 venues incl. legacy placeholder room `'none'`. |
| `Schedule` | `id, semester, startTime "HH:MM", endTime "HH:MM", days (comma-joined DayCode string), facultyId? → FacultyProfile (SetNull), blockId → Block (Cascade), subjectId → Subject (Cascade), roomId → Room (Cascade), createdAt; @@index([roomId, semester]), @@index([facultyId])` | `table_sched` | Day color columns (`Monday…Sunday` = `'green'`/`'red'`) → one `days` string (subset of `MON,TUE,WED,THU,FRI,SAT,SUN`); status color is **computed** (FR-021), never stored. Times `HH:MM:SS` → `HH:MM` (lexicographically comparable). |
| `RosterEntry` | `id, name, blockId? → Block (Cascade); @@unique([name, blockId])` | `exprimental_studentlist` (typo kept as table name only) | `blockId` nullable: all 6 legacy rows have `block=''` (no block recorded). Registration gate (FR-004) requires name + block match when a block is recorded; name-only otherwise (legacy behavior of `student_register.php`). |

## Deviations from the frozen ARCHITECTURE §3 (justified, flagged to Leader)

1. **`Schedule.facultyId` nullable + `onDelete: SetNull`** — required by the frozen status contract (`NO_FACULTY` state, FR-021) and by legacy `table_sched` row 49 (`faculty='None'`). ARCHITECTURE §3 does not mark it required. SetNull means deleting a faculty member preserves their schedules (they become "No Faculty") instead of cascading them away.
2. **`RosterEntry.blockId` nullable** — required to carry the 6 verified legacy roster rows (all `block=''`) without inventing a block assignment. ARCHITECTURE §3 marks optional relations with `?` elsewhere (e.g. `userId? @unique`), and does not mark this one required.

## Seed (prisma/seed.ts — idempotent: deleteMany + create in one transaction)

Verified counts: **17 users, 17 faculty profiles, 8 blocks, 28 subjects, 13 rooms, 36 schedules, 6 roster entries.**

- **Users:** 1 admin (`admin` / `admin123`, bcrypt cost 10) + 16 faculty (username = faculty name). 6 faculty keep their legacy `$2y$` hash verbatim (legacy passwords still work); 10 without a legacy password get dev password `faculty123`.
- **FacultyProfile `Admin`** is linked to the admin `User` — mirrors the legacy ci-collation relationship between `admin_register.name='admin'` and `it_faculty.Name='Admin'`, and blocks faculty-registration squatting on that name.
- **Blocks:** the 7 `blocks_detail` rows verbatim (advisors all `'None'` → `advisorId: null`; note `'Combined BSED 3  SCIENCE and MATHEMATICS'` keeps its double space) **+ 1 schedule-integrity block `BTLED`** (yearLevel `"Not specified"`): schedule rows 1, 2, 3, 5, 7 reference `blocks='BTLED'`, which does not exist in `blocks_detail`; `Schedule.blockId` is a required FK, and the block string was displayed verbatim in legacy utilization tables. FLAGGED to Leader (FR-011's "7 blocks" = the `blocks_detail` seed; this 8th row exists to preserve schedule data).
- **Roster:** 6 legacy rows with `blockId: null`.
- **Schedules:** all 36 `table_sched` rows; `faculty:'None'` (row 49) → `facultyId: null`; room `'none'` maps to the seeded Room `'none'`; times converted to `HH:MM`; days from `'green'` columns; all rows `'1st Sem'`.
- **Heartbeats** ported verbatim as Asia/Manila instants (e.g. `2023-10-02T13:18:51+08:00`), so badges correctly render `Vacant N day(s)` until faculty log in and heartbeat.

## Legacy table → new model cross-reference

| Legacy table | Disposition |
| :--- | :--- |
| `it_faculty` | split: profile data → `FacultyProfile`; login capability → `User` (role FACULTY) |
| `admin_register` | → `User` (role ADMIN), 3-account cap moved into `/api/auth/register/admin` |
| `student` | → `User` (role STUDENT); registration gate via `RosterEntry` (FR-004) |
| `blocks_detail` | → `Block` (+ schedule-integrity `BTLED`, see above) |
| `subject` | → `Subject` (description only) |
| `rooms` | → `Room` |
| `table_sched` | → `Schedule` (days string replaces 7 color columns; facultyId nullable) |
| `exprimental_studentlist` | → `RosterEntry` |
