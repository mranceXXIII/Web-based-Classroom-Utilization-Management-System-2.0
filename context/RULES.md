# RULES: Coding Standards & Architecture Rules

> **Purpose:** Specify project coding rules, language standards, architecture guidelines, and design principles so all generated code is clean, consistent, and maintainable. Tier-3 template, filled in for this project.

_Last updated: September 29, 2026_

---

## 1. Language & PHP Standards

- **Runtime:** PHP 8.0. No framework, no Composer, no autoloading. Pages stay procedural with inline HTML.
- **Strict Types for New Files:** New PHP files start with `declare(strict_types=1);` and use explicit parameter and return types.
- **Legacy Files:** Do not rewrite legacy files wholesale. Match the surrounding style. **[PLACEHOLDER: Decide whether legacy files adopt strict_types incrementally]**

---

## 2. Naming Conventions (Files & Code)

- **Existing Patterns:** File names use MixedCase with underscores (`HomeTableMainFunc.php`, `student_register.php`). Functions mix `camelCase` and `snake_case` (`statusFunc`, `getQuarter`, `createSchedulTable`).
- **Rule:** Match the naming style of the file you edit. Do not rename existing functions or tables in a governance pass. **[PLACEHOLDER: Decide on a target naming convention for new modules]**

---

## 3. Code Structure & Organization Rules

- **One Page Per Concern:** Keep each page focused on one flow (login, dashboard, one CRUD list). Do not add new pages that mix several flows.
- **Canonical Modules:** `Admin/CRUD` is the canonical faculty CRUD. `Admin/CRUD_ForBlocks` duplicates it. Edit the canonical module unless the task names the duplicate. Do not create new duplicated module copies.
- **Shared Includes:** Reuse `rsuHeader.php`, `footer.php`, and the module `config.php` includes. Do not copy their contents inline.

---

## 4. DRY & KISS Guidelines

- **No New Duplication:** The codebase carries known duplicates (`CRUD` vs `CRUD_ForBlocks`, `ad.php` vs `admin.php`, and the Faculty vs Students copies of `HomeTableMainFunc.php`). Do not add more. Consolidate only when the task explicitly asks. **[PLACEHOLDER: Decide the dedupe order]**
- **KISS:** Keep fixes minimal and matched to the existing procedural style.

---

## 5. Session & State Rules

- **Session Guard Mandatory:** Every page that assumes a logged-in user MUST start with `session_start()` and redirect to the role login page when `$_SESSION['username']` is absent. Today only `Faculty/heartbeat.php` checks the session. The dashboard pages do not.
- **Session Destroy on Logout:** Logout MUST destroy the session (`session_destroy()`), not redirect only. `logo.php` currently redirects without destroying.

---

## 6. Validation Strategy

- **Boundary Validation:** Validate every `$_POST` value at the top of the handler before any query runs. Use `filter_var` and `preg_match` as the existing CRUD pages do.
- **Type Expectations:** Cast or validate numeric IDs before query binding.

---

## 7. Error Handling & Security Practices

- **Prepared Statements Only:** Direct variable interpolation or concatenation inside SQL is banned. Use prepared statements with parameter binding everywhere, including `facultyLogin.php`, `Faculty/heartbeat.php`, and `statusFunc()`.
- **Password Handling:** Hash with `password_hash()` and verify with `password_verify()`. Never store or log plain passwords.
- **Output Escaping:** Escape all dynamic HTML output with `htmlspecialchars($value, ENT_QUOTES, 'UTF-8')`.
- **No Secrets in Code:** Never hardcode credentials in source. The five `config.php` files carry hardcoded root credentials. Treat them as locked files. **[PLACEHOLDER: Decide the credentials strategy (environment variables or one config outside version control)]**
- **No Unsafe Constructs:** Ban `eval()`, `exec()`, `shell_exec()`, `system()`, and the `@` suppression operator in new code.
- **[PLACEHOLDER: Decide on CSRF token requirements for state-modifying POST endpoints]**

---

## 8. Database Rules

- **Single Database:** `educ_room_utilization`. Do not reference the legacy name `room_util_sys_db` in new code.
- **Schema Changes:** Version schema changes as new SQL files. Never edit the existing dumps. **[PLACEHOLDER: Decide on a migration tool and file convention]**
- **Referential Integrity:** The dump declares no foreign keys. New tables MUST declare foreign keys with explicit cascade behavior.

---

## 9. Testing & Verification Conventions

- **No Tests Exist:** The project has no test suite. New logic ships with a test. **[PLACEHOLDER: Decide on the test framework (PHPUnit or Pest) and the test directory]**
- **Manual Verification:** For legacy pages without tests, verify changes by exercising the affected flow against a local MySQL instance seeded with `db/educ_room_utilization.sql`.

---

## 10. Commit & PR Conventions

- **Commit Messages:** **[PLACEHOLDER: Decide the commit message format, for example Conventional Commits]**
- **Branch Naming:** **[PLACEHOLDER: Decide the branch naming convention]**