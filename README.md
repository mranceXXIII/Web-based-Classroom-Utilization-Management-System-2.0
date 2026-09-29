# Web-based Classroom Utilization Management System 2.0

- **Project:** Web-based Classroom Utilization Management System 2.0
- **Repository:** https://github.com/mranceXXIII/Web-based-Classroom-Utilization-Management-System-2.0.git
- **Working copy:** E:\sideQuest\Web-based-Classroom-Utilization-Management-System-2.0
- **Audit date:** 2026-09-29
- **Audit method:** agent-spec adapt-project skill (v1.0.0), runtime Cline, non-destructive read-only inspection
- **Workspace status:** Zero-Context Workspace. No context/ directory or .agents/ configuration existed before this file.
- **Purpose:** Records what the audit found inside the repository. Facts come from direct file reads. Open business decisions stay as placeholders in Section 10.

## 1. Project Overview

The project is a server-rendered PHP web application for Romblon State University Cajidiocan Campus, Education Department. It tracks classroom and venue utilization. Each schedule row records which faculty member handles which block, in which room, at what time, on which day, and in which semester. Three role portals share one entry point:

- **Admin:** manages faculty records, blocks, subjects, rooms, schedules, and student rosters.
- **Faculty:** views room and schedule status and publishes presence through a heartbeat.
- **Student:** views room and schedule status.

Faculty and Students dashboards render live availability. A presence heartbeat stores a timestamp per faculty row, and the status logic converts timestamps and schedule times into colored status badges.

## 2. Detected Stack

| Layer | Finding | Evidence |
| --- | --- | --- |
| Backend | PHP 8.0, procedural pages with inline HTML, no framework, no MVC, no Composer | CI workflow pins PHP 8.0, SQL dump header records PHP 8.0.28, no composer.json in the repo |
| Database | MySQL/MariaDB, database name educ_room_utilization | db/educ_room_utilization.sql header: MariaDB 10.4.28, phpMyAdmin 5.2.1 |
| DB access | Mixed mysqli and PDO across files | adminLogin.php uses mysqli with prepared statements, studentLogin.php uses PDO, facultyLogin.php uses mysqli with string interpolation |
| Frontend | Server-rendered HTML with inline style blocks, Bootstrap 3.3.7 and 4.0.0 via CDN, jQuery 2.2.0, 3.2.1, and 3.3.1, Font Awesome 5.x, Google Fonts (Poppins, Material Icons), html2pdf.js 0.10.1, local jQuery UI 1.10.4 | Page heads in the Admin, Faculty, and Students modules |
| Vendored assets | AOS, Nice Select, Revolution Slider, baguetteBox, ACME news ticker, icon fonts | Admin/css, Admin/js, Admin/font, Admin/baguetteBox.js-dev, Admin/news-ticker-controls-acme |
| Auth | PHP native sessions, bcrypt through password_hash and password_verify | Login and register files at the repo root |
| CI | GitHub Actions Symfony template workflow, expects composer.json, .env.test, PHPUnit, and SQLite, none of which exist | .github/workflows/symfony.yml |
| Tests | No tests found | Full recursive file listing |
| Agent runtime | Cline | Current environment |

## 3. Directory and File Map

### 3.1 Root files

| File | Role |
| --- | --- |
| index.php | Entry page. A radio group selects Admin, Faculty, or Student and posts to redirect.php. Includes rsuHeader.php and footer.php. |
| redirect.php | Reads the posted option and redirects to adminLogin.php, facultyLogin.php, or studentLogin.php. |
| rsuHeader.php | Shared page head and university banner. Sets the pink and green gradient background and the educLogo.png watermark. Page title: Classroom Utilization Management System. |
| footer.php | Shared footer bar. Text: Serving with Honor and Excellence! |
| config.php | Database credentials. localhost, root, empty password, database educ_room_utilization. |
| adminLogin.php | Admin login. Verifies against admin_register with a prepared statement and password_verify, sets $_SESSION['username'], redirects to Admin/admin.php. |
| adminRegister.php | Admin registration. Allows a name only when it exists in it_faculty and admin_register holds fewer than 3 accounts. Hashes with password_hash and inserts into admin_register. |
| facultyLogin.php | Faculty login. Queries it_faculty by string interpolation, verifies with password_verify, sets the session, redirects to Faculty/HomeTableMainFunc.php. |
| facultyRegister.php | Faculty password setup. Updates the it_faculty password only when the row password is NULL or empty. Uses PDO. |
| studentLogin.php | Student login. Verifies against student with a PDO prepared statement, redirects to Students/HomeTableMainFunc.php. |
| student_register.php | Student registration. Verifies the name against exprimental_studentlist, fills the block dropdown from blocks_detail plus an Irregular option, inserts into student. Uses PDO. |
| README.md | Title line only. |
| u129841553_educ_room_util.sql | Alternate SQL dump from hosting. Its file hash differs from db/educ_room_utilization.sql, so treat db/educ_room_utilization.sql as the current dump. |
| educLogo.png, rsuLogo.png, ItLogo.png | Branding images used as watermarks and favicons. |

### 3.2 Admin module

| Path | Role |
| --- | --- |
| Admin/admin.php | Admin dashboard shell. Sidebar menu with Home, Blocks, Schedules, Faculty, List, and Logout. Tab switching through openTab(). Iframes embed CRUD/index.php for the Faculty tab and the schedulingsystem list.php for the List tab. |
| Admin/ad.php | Alternate static dashboard shell with the same tabs and iframes. |
| Admin/admin.html, Admin/home.html, Admin/new.html | Static HTML mockups. |
| Admin/adminScript.js, Admin/adminStyle.css | Sidebar toggle and tab styling behavior. |
| Admin/CRUD/ | Faculty management for the it_faculty table. index.php renders the record list with client side search. Files: create.php, read.php, update.php, delete.php, deletePass.php, error.php, config.php, and css, fonts, and js assets. Form validation uses filter_var and preg_match. |
| Admin/CRUD_ForBlocks/ | Near duplicate of CRUD targeting blocks. |
| Admin/HomeMainFunc/ | Schedule setting module. home.php renders a Set Schedule form that posts to add.home.php. Files: add.home.php, read.php, update.php, timelist.php, navbar.php, error.php, config.php. Hardcodes the legacy database name room_util_sys_db. |
| Admin/Scheduling_SystemSimple PHP/schedulingsystem/ | Largest subsystem. list.php renders room, faculty, and schedule lists with table to CSV export buttons. tablelist.php renders the schedule matrix. Files: roomlist.php, faclist.php, sublist.php, studentList.php, roomListSchedule.php, tb.php, timelist.php, home.php, addcourse.php, addroom.php, addsubject.php, addStudent.php, registerStudent.php, addCSV.php, processCSV.php, updateFacName.php, updateBlock.php, updateBlockAndFac.php, updateSub.php, delete.php, logs.php, regis.php, generate-pdf.php, insertion.sql, header.php, footer.php, navbar.php, config.php, plus local jQuery UI 1.10.4 and Bootstrap 3 assets. processCSV.php imports uploaded CSV names into exprimental_studentlist. |
| Admin/news-ticker-controls-acme/, Admin/baguetteBox.js-dev/, Admin/assets/, Admin/css/, Admin/font/, Admin/images/, Admin/img/, Admin/js/ | Third-party libraries and static assets. |

### 3.3 Faculty module

| Path | Role |
| --- | --- |
| Faculty/HomeTableMainFunc.php | Main utilization view. Includes heartbeat.php and logo.php. Renders two views: per-room weekly tables and a block and faculty list with live status. Functions: statusFunc (line 132), createScheduleTable (line 240), roomScheduleTable (line 344), createSchedulTable (line 346), getQuarter (line 428). Search, refresh, start time sort, and view switch run through inline JavaScript. |
| Faculty/heartbeat.php | Updates it_faculty.timestamp to NOW() for the session user. Checks $_SESSION['username']. |
| Faculty/heartbeat.js | Client side polling script for heartbeat.php. |
| Faculty/logo.php | Page banner with a logout confirmation. Confirm redirects to ../index.php. |
| Faculty/header.php, Faculty/footer.php | Legacy head and footer includes, referenced by commented out code. |
| Faculty/config.php | Database credentials, same values as the root config. |
| Faculty/educLogo.png, Faculty/rsuLogo.png | Branding images. |

### 3.4 Students module

| Path | Role |
| --- | --- |
| Students/HomeTableMainFunc.php | Same utilization view as the Faculty copy. The heartbeat include is commented out, so students do not publish presence. |
| Students/header.php, Students/footer.php | Head and footer includes. |
| Students/config.php | Database credentials, same values as the root config. |
| Students/educLogo.png, Students/rsuLogo.png | Branding images. |

## 4. Database Schema

Source: db/educ_room_utilization.sql, a phpMyAdmin 5.2.1 dump from MariaDB 10.4.28, generated 2023-10-03. All tables use InnoDB with charset utf8mb4_general_ci. Primary keys and AUTO_INCREMENT values arrive through ALTER statements at the end of the dump.

| Table | Columns | Purpose |
| --- | --- | --- |
| admin_register | id (PK, AUTO_INCREMENT), name, password | Admin accounts. Passwords are bcrypt hashes. Seeded with one user named admin. |
| blocks_detail | id (PK), name, year_level, advisor | Block catalog. Seven seeded blocks: BSED 3 ENGLISH, BSED 3 SCIENCE, BSED 3 MATHEMATICS, BEED 3, BTLED 3, and two combined blocks. |
| exprimental_studentlist | id (PK), Name, block | Official student roster. The table name carries the typo exprimental. Six seeded names with empty block values. |
| it_faculty | id (PK), Name, Academic_Rank, Advisory, password (nullable), timestamp | Faculty records. 17 seeded rows. The timestamp column is a presence heartbeat. Only some rows hold passwords. |
| rooms | id (PK), room | Venue catalog. 13 seeded venues: 201, 202, 203, 205, 206, 103, 102 - OSAS Office, Backstage, Defense Room, Canteen, Covered Court, Stage, none. |
| student | id (PK), student_name, blocks, year_level, password | Student login accounts. Five seeded rows. |
| subject | subject_id (PK), subject_code, subject_description | Subject catalog. 29 seeded rows. |
| table_sched | id (PK), faculty, blocks, subject, room, Monday through Sunday (each DEFAULT 'red'), Start_Time (time), End_Time (time), Semester | Schedule matrix. About 45 seeded rows, all 1st Sem. Day columns hold green or red. |

## 5. Request Flows and Core Logic

### 5.1 Entry and auth flows

- index.php posts the selected role to redirect.php, which redirects to the matching login page.
- Admin login verifies against admin_register with a prepared statement and password_verify, sets $_SESSION['username'], and redirects to Admin/admin.php.
- Faculty login queries it_faculty through string interpolation, verifies with password_verify, sets the session, and redirects to Faculty/HomeTableMainFunc.php.
- Student login verifies against student with a PDO prepared statement and redirects to Students/HomeTableMainFunc.php.
- Admin registration requires the name to exist in it_faculty and caps admin_register at 3 accounts.
- Faculty registration sets a password only when the it_faculty row has none.
- Student registration requires the name to exist in exprimental_studentlist and inserts the chosen block and hashed password into student.

### 5.2 Dashboard rendering

- getQuarter() maps the numeric month to a semester: months 8 through 12 return 1st Sem, months 1 through 5 return 2nd Sem, otherwise Vacation.
- createScheduleTable() and createSchedulTable() join table_sched with rooms and render one weekly table per room, with green or red cells for each day column, filtered by the current day and semester.
- roomScheduleTable() renders the block, faculty, start time, end time, and status list for the current day.
- statusFunc() looks up the faculty row in it_faculty and compares its timestamp with the current time in the Asia/Manila timezone. A gap larger than 0 days or 900 minutes renders a red badge: Vacant with the day count, or Unavailable with minutes or hours. Otherwise the current time is compared with Start_Time and End_Time: inside the range renders a green Active badge, outside renders a blue Inactive badge. A missing faculty row renders No Faculty.
- Faculty/HomeTableMainFunc.php includes heartbeat.php, which sets it_faculty.timestamp to NOW() for the session user. heartbeat.js polls it from the browser. The Students copy keeps this disabled.

### 5.3 Admin subsystems

- Admin/CRUD manages it_faculty records through create, read, update, and delete pages with client side search and regex validation.
- Admin/HomeMainFunc writes schedules through a Set Schedule form.
- Admin/Scheduling_SystemSimple PHP/schedulingsystem lists rooms, faculties, subjects, students, and schedules, exports tables to CSV, imports student names from CSV, and offers a generate-pdf.php export.

## 6. Observations and Risks

Facts recorded during the audit:

- Five config.php files hardcode root with an empty password: root, Faculty, Students, Admin/CRUD, and Admin/Scheduling_SystemSimple PHP/schedulingsystem.
- facultyLogin.php, Faculty/heartbeat.php, and statusFunc() build SQL through string interpolation, so those paths are open to SQL injection. Other auth paths use prepared statements.
- Dashboard pages do not guard the session. Admin/admin.php, Faculty/HomeTableMainFunc.php, and Students/HomeTableMainFunc.php open for unauthenticated visitors. Only heartbeat.php checks $_SESSION.
- Logout in logo.php redirects to ../index.php but does not destroy the session. No logout.php exists.
- The GitHub Actions workflow expects composer.json, .env.test, PHPUnit, and SQLite. None exist, so CI fails as configured.
- Admin/HomeMainFunc/home.php hardcodes the legacy database name room_util_sys_db instead of educ_room_utilization.
- Duplicated modules exist: CRUD and CRUD_ForBlocks, ad.php and admin.php, and the Faculty and Students copies of HomeTableMainFunc.php. Many commented out code blocks remain.
- Mixed mysqli and PDO usage across files.
- No tests, no Composer, and no linter configuration exist.

## 7. Recommended Agent-Spec Modules and Skills

Selection follows references/module-mapping-guide.md for the Full-Stack / Web App category, extended with security coverage:

- skills/dev-workflow/workflows/plan-feature: plan changes against the existing PHP page flow before editing.
- skills/dev-workflow/workflows/api-endpoint-generator: generate PHP endpoints for CRUD and scheduling data.
- skills/dev-workflow/workflows/database-migration: version schema changes for the MySQL database.
- skills/dev-workflow/workflows/engineering-loop/code-inspection: inspect legacy pages before refactors.
- skills/dev-workflow/testing/write-a-test: establish test coverage. The project has none.
- skills/dev-workflow/workflows/security-auditor: address SQL injection paths, missing session guards, and hardcoded credentials.
- skills/design-engineering: govern inline CSS and Bootstrap usage.
- shared/engineering/backend/php-principles.md, shared/engineering/database/database-principles.md, and shared/engineering/security/security-best-practices.md: shared rules for backend, data, and security work.

## 8. Recommended Context Templates

- context/ARCHITECTURE.md: records the stack boundaries and page flow for downstream agents.
- context/SCHEMA.md: records the eight MySQL tables and their relationships.
- context/RULES.md: locks config.php files and restricts writes to target feature areas.
- context/PRD.md: captures product goals and role requirements with placeholders.
- context/TASKS.md: tracks the remediation work from Section 6.
- **Provisioned with user approval on 2026-09-29:** context/ARCHITECTURE.md, context/SCHEMA.md, context/RULES.md, context/PRD.md, context/TASKS.md, .agents/AGENTS.md, and .agents/shared/SHARED_RULES.md. Verified technical facts are pre-filled. Business decisions remain as [PLACEHOLDER: ...] markers for human review.

## 9. System Prompt Framing for Downstream Agents

- **Role:** You work on a legacy PHP 8.0 and MySQL classroom scheduling application. Read context.md before changes.
- **Scope bounds:** Never edit config.php files, SQL dump files, or files outside the named target module. Preserve the existing page structure and naming.
- **Constraints:** Follow the Cline step validation pattern. Validate each step before proceeding. Ask for confirmation before writing files. Keep changes minimal and matched to the existing procedural style.

## 10. Open Questions for Human Review

- [PLACEHOLDER: Deployment target and PHP version to standardize on]
- [PLACEHOLDER: Keep mysqli or migrate all database access to PDO]
- [PLACEHOLDER: Database credentials policy for local and production environments]
- [PLACEHOLDER: Whether CI should test plain PHP pages instead of the Symfony template]
