# EXISTING-PROJECT-ANALYSIS — Web-based Classroom Utilization Management System 2.0

_Run: 2026-10-14-sqlite-prisma-ui-unification · Author: Team Leader · Sources: direct file reads of `context.md`, `context/SCHEMA.md`, `context/ARCHITECTURE.md`, `context/PRD.md`, `db/educ_room_utilization.sql`_

## 1. What Exists Today

A server-rendered **PHP 8.0 procedural web app** (no framework, no Composer, no MVC) for **Romblon State University Cajidiocan Campus, Education Department**, tracking classroom/venue utilization. Three role portals share one entry point:

| Role | Login | Dashboard | Notes |
| :--- | :--- | :--- | :--- |
| Admin | `adminLogin.php` → `Admin/admin.php` | Tabs + iframes; faculty CRUD, blocks, subjects, rooms, schedules, student roster, CSV import/export, PDF | `admin_register` capped at 3 accounts; name must exist in `it_faculty` |
| Faculty | `facultyLogin.php` → `Faculty/HomeTableMainFunc.php` | Weekly room utilization tables + status badges + presence heartbeat | Login by faculty **name** |
| Student | `studentLogin.php` → `Students/HomeTableMainFunc.php` | Read-only utilization view | Registration gated by roster membership |

## 2. Stack (verified)

| Layer | Finding |
| :--- | :--- |
| Backend | PHP 8.0 procedural pages, inline HTML, mixed `mysqli`/`PDO` |
| Database | MySQL/MariaDB `educ_room_utilization` (MariaDB 10.4.28 dump, InnoDB, utf8mb4), **no FK constraints** — relationships by name convention |
| Frontend | Bootstrap 3.3.7 + 4.0.0 CDN, jQuery ×3 versions, Font Awesome 5, html2pdf.js, vendored AOS/NiceSelect/RevolutionSlider/baguetteBox/ACME ticker |
| Auth | PHP native sessions, bcrypt (`password_hash`/`password_verify`) |
| Tests / CI | None / Symfony-template workflow that fails (expects composer.json, PHPUnit, SQLite — none exist) |

## 3. Data Model (8 MySQL tables → migration source of truth)

Source dumps: `db/educ_room_utilization.sql` (current) and root `u129841553_educ_room_util.sql` (alternate export). **Never modify either.**

| Legacy table | Purpose | Key columns |
| :--- | :--- | :--- |
| `it_faculty` | Faculty records + presence heartbeat + optional login | `Name` (join key), `Academic_Rank`, `Advisory`, `password` (bcrypt, nullable), `timestamp` (heartbeat) |
| `table_sched` | Schedule matrix | `faculty`, `blocks`, `subject`, `room` (name joins), `Monday…Sunday` (`green`/`red`), `Start_Time`, `End_Time`, `Semester` |
| `admin_register` | Admin logins (cap 3, name ∈ `it_faculty`) | `name`, `password` |
| `blocks_detail` | Blocks | `name`, `year_level`, `advisor` |
| `exprimental_studentlist` | Official student roster (typo in name is legacy) | `Name`, `block` |
| `rooms` | 13 venues | `room` |
| `subject` | Subjects | `subject_description` |
| `student` | Student logins | (per SCHEMA.md) |

Seed data (verified from dump): 7 blocks, 6 roster entries, ≥8 faculty (Admin, Gerardo Ribon, Clara Jean Juanzo, Angelica Rico, Raymund Ipedro, Ma Lourdes Rivero, Ezekiel Roa, Marco Rivas…), 13 rooms, 1 admin (`admin`), schedules referencing rooms 201–206 etc.

## 4. Domain Logic to Port (exact semantics)

1. **`statusFunc()` status rules (Asia/Manila timezone):** heartbeat gap > 0 day → red `Vacant N day(s)`; gap ≤ 15h → red `Unavailable X min/hr(s)` (900-minute threshold); else current time within `Start_Time`–`End_Time` → green `Active`, else blue `Inactive`; missing faculty row → `No Faculty`.
2. **`getQuarter()` semester mapping:** months 8–12 → `1st Sem`; 1–5 → `2nd Sem`; else `Vacation`.
3. **Weekly room tables:** one table per room; day columns hold class/no-class; block+faculty list per room.
4. **Heartbeat:** `heartbeat.js` polls `heartbeat.php` → `UPDATE it_faculty SET timestamp = NOW()`.
5. **CSV export** of schedule lists; **PDF export** (html2pdf.js) — port as print-friendly view in rebuild.
6. **CSV roster import** (`processCSV.php`) into `exprimental_studentlist`.

## 5. Known Defects in Legacy (do NOT port)

- SQL string interpolation in `facultyLogin.php`, `Faculty/heartbeat.php`, `statusFunc()` → SQLi.
- Dashboards unguarded (`Admin/admin.php`, both `HomeTableMainFunc.php`); only `heartbeat.php` checks session.
- Logout never destroys session; no CSRF protection; hardcoded root DB credentials in 5 `config.php` copies.
- `Admin/HomeMainFunc/home.php` references legacy DB name `room_util_sys_db`.
- Duplicated modules: `CRUD` vs `CRUD_ForBlocks`, `ad.php` vs `admin.php`, Faculty/Students copies of `HomeTableMainFunc.php`.

## 6. Implication of the Requested Change

The user requests **SQLite + Prisma + unified minimalist UI with dark/light toggle**. Prisma is a Node.js/TypeScript ORM: **the backend must be rebuilt on Node**, not patched in PHP. Decision: full-stack **Next.js (App Router, TypeScript)** monorepo-style single app — API routes + Prisma + SQLite for data, React server/client components for UI. Legacy PHP stays untouched in-place (reference only); the new app is the 2.0 deliverable. No data migration tool is required beyond a seed script derived from the verified dump.
