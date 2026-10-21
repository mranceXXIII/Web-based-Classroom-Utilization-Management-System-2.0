# Web-based-Classroom-Utilization-Management-System-2.0

Romblon State University Cajidiocan Campus — Education Department.
Classroom Utilization Management System, rebuilt from the legacy PHP/MySQL app
onto **Next.js 15 + TypeScript + Tailwind v4 + Prisma 6 + SQLite**.

## Quick start (3 commands)

```bash
npm install     # installs deps, generates the Prisma client, then auto-setup:
                #   - creates .env (random AUTH_SECRET) if missing
                #   - applies the committed database migrations (SQLite)
                #   - seeds the legacy data (skipped if already seeded)
npm run dev     # → http://localhost:3000
```

That's it — the database is created and seeded automatically on first install.
Production build: `npm run build` then `npm run start`.

## Default logins (dev)

| Role | Username | Password | Portal |
|---|---|---|---|
| Admin | `admin` | `admin123` | `/admin` |
| Faculty | e.g. `Angelica Rico` (any faculty without a legacy password) | `faculty123` | `/faculty` |
| Student | register at `/register/student` (name must be on the roster) | your choice | `/student` |

Faculty with ported legacy password hashes (Gerardo Ribon, Clara Jean Juanzo,
Raymund Ipedro, Reynaldo Catajay, Abegail Rojo, Carren May Juanzo) keep their
original (unknown) passwords — reset them via the admin Faculty module.

## Modules

| Module | Route | Ported from |
|---|---|---|
| Role selection | `/` | `index.php` + `redirect.php` |
| Per-role login / register | `/login/[role]`, `/register/[role]` | `*Login.php`, `*Register.php`, `student_register.php` |
| Admin overview | `/admin` | `admin.php` |
| Faculty CRUD | `/admin/faculty` | `Admin/CRUD` |
| Blocks CRUD | `/admin/blocks` | `Admin/CRUD_ForBlocks` |
| Subjects / Rooms CRUD | `/admin/subjects`, `/admin/rooms` | `Scheduling_System` add.sub / add.room |
| Schedules CRUD + CSV export | `/admin/schedules` | `Scheduling_System` home/add.home/tablelist |
| Utilization tables + status badges | `/admin/utilization`, `/faculty`, `/student` | `HomeTableMainFunc.php` (statusFunc) |
| List (rooms/faculties/subjects/class-time + search + per-table CSV) | `/admin/list` | `Scheduling_System` list.php |
| Roster + CSV import | `/admin/roster` | `addStudent.php`, `processCSV.php` |
| Faculty heartbeat (presence) | `/faculty` | `Faculty/heartbeat.php` |

RSU branding (banner, `rsuLogo.png` seal, `educLogo.png` watermark,
"Serving with Honor and Excellence!" footer, Poppins stack) is ported from
`rsuHeader.php` / `footer.php`. Light/dark toggle lives in the banner and
persists per browser.

## Useful scripts

- `npm run setup` — re-run the bootstrap manually (safe, idempotent)
- `npm run db:seed` — force-reseed from the legacy SQL data (wipes current rows)
- `npm run db:migrate` — create/apply migrations in development

## Notes

- The SQLite database lives at `prisma/dev.db` (gitignored) and is recreated by
  the auto-setup on first install.
- Legacy PHP sources under `Admin/`, `Faculty/`, `Students/` and the SQL dumps
  are kept untouched for reference; the authoritative legacy data source for the
  seed is `db/educ_room_utilization.sql`.
- Don't run `npm run build` while `npm run dev` is active (they share `.next`).
- Security hardening and deployment checklist: see `README-SECURITY.md`.
