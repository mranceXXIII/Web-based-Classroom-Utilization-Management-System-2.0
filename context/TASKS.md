# TASKS: Execution Plan

> **Purpose:** The singular source of truth for execution sequencing and progress tracking. AI agents must execute exactly one numbered task at a time as directed by the user. Tier-3 template, filled in for this project from the audit remediation list.

_Last updated: September 29, 2026_

---

How to use this: point the AI at one numbered task per session.
"Do 2.1", not "fix the security issues".

A task is too big if you can't describe it in one line.

**Status:** `[ ]` todo, `[~]` in progress, `[x]` done, `[!]` blocked

---

## 1. Setup

- [ ] 1.1 Centralize database credentials: replace the five hardcoded `config.php` copies with one shared include outside version control or with environment variables (see `[PLACEHOLDER: credentials decision in context/RULES.md section 7]`)
- [ ] 1.2 Fix CI: replace the Symfony template workflow with one that lints plain PHP files (`php -l`) or installs PHPUnit correctly
- [ ] 1.3 `[PLACEHOLDER: Add linter and formatting configuration]`

## 2. Security remediation

- [ ] 2.1 Convert `facultyLogin.php` to a prepared statement with parameter binding
- [ ] 2.2 Convert `Faculty/heartbeat.php` to a prepared statement
- [ ] 2.3 Convert `statusFunc()` in both `HomeTableMainFunc.php` copies to a prepared statement
- [ ] 2.4 Add session guards to `Admin/admin.php`, `Faculty/HomeTableMainFunc.php`, and `Students/HomeTableMainFunc.php`
- [ ] 2.5 Add `logout.php` that destroys the session and update the logout links in `logo.php`
- [ ] 2.6 `[PLACEHOLDER: CSRF tokens and secure cookie flags for state-modifying POST endpoints]`

## 3. Data layer

- [ ] 3.1 Unify the legacy database name: remove `room_util_sys_db` from `Admin/HomeMainFunc/home.php`
- [ ] 3.2 `[PLACEHOLDER: Decide on a migration tool and version the schema changes]`
- [ ] 3.3 `[PLACEHOLDER: Decide whether to fix the exprimental_studentlist table name typo]`

## 4. `[PLACEHOLDER: Feature name]`

- [ ] 4.1 ...

## 5. Polish

- [ ] 5.1 Add test coverage for auth and status logic (see `[PLACEHOLDER: test framework decision in context/RULES.md section 9]`)
- [ ] 5.2 `[PLACEHOLDER: Decide the dedupe order for CRUD_ForBlocks, ad.php, and the duplicated HomeTableMainFunc.php]`
- [ ] 5.3 Remove commented out dead code in touched files

---

## Blocked

- [!] `[PLACEHOLDER: task]`, waiting on `[PLACEHOLDER: what]`

## Parked

Things deliberately deferred. Not forgotten, not being built.

- `[PLACEHOLDER: thing]`, revisit after v1