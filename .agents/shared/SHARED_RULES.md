# Shared App Coding Rules (this repository)

> **Purpose:** Foundational coding rules for PHP and MySQL work shared across all modules of this repository (root, Admin, Faculty, and Students). Module-specific rules in `context/RULES.md` layer on top of this file.

_Last updated: September 29, 2026_

---

## 1. PHP Standards

- **Strict Types:** New PHP files start with `declare(strict_types=1);` immediately after the opening tag and use explicit parameter and return types.
- **Prepared Statements Mandatory:** Direct variable interpolation or string concatenation inside SQL queries is banned. Use prepared statements with parameter binding without exception.
- **Context-Aware Escaping:** Escape all dynamic output rendered to HTML with `htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')`.
- **Password Hashing:** Hash with `password_hash()` (PASSWORD_DEFAULT or stronger) and verify with `password_verify()`. Legacy functions (`md5`, `sha1`, `crypt`) are banned.
- **Ban Unsafe Constructs:** Ban `eval()`, `create_function()`, `exec()`, `shell_exec()`, `system()`, `passthru()`, shell backticks, and the `@` suppression operator.
- **No Global State in New Code:** Do not introduce `global $var` or raw superglobals inside new application logic. Read `$_POST` and `$_SESSION` at the top of the handler and pass values onward.

---

## 2. Database Standards

- **Single Database:** `educ_room_utilization` on MySQL/MariaDB. Do not reference the legacy name `room_util_sys_db`.
- **Schema Design:** New tables target 3rd Normal Form, use `NOT NULL` by default, declare primary keys, and declare foreign keys with explicit cascade behavior.
- **Migrations:** Version schema changes as new idempotent SQL files. Never modify the existing dumps (`db/educ_room_utilization.sql`, `u129841553_educ_room_util.sql`).
- **Transactions:** Keep transactions lean. Use `READ COMMITTED` for standard operations.

---

## 3. Security Standards

- **Least Privilege:** Enforce server-side checks on every page and data path. Do not rely on client-side hiding (hidden columns, disabled buttons) as access control.
- **Session Security:** Guard sessions on every page that assumes login. Set `SameSite=Lax` or `Strict`, `Secure`, and `HttpOnly` cookie flags when touching session configuration. **[PLACEHOLDER: Confirm the deployment transport (HTTPS availability)]**
- **No Secrets in Code:** Never commit credentials or API keys. The five `config.php` files carry hardcoded root credentials and are locked files pending the credentials decision.
- **Input Validation:** Validate and sanitize all external data at page boundaries before queries run.

---

## 4. Frontend Standards

- **Match Existing Style:** Pages use inline `<style>` blocks and CDN Bootstrap and jQuery. Match the surrounding style. Do not introduce a build pipeline or a CSS framework migration inside small fixes.
- **Progressive Enhancement:** Keep client-side behaviors (search, sort, view switching) as progressive enhancements on server-rendered tables.

---

## 5. Source References

These rules derive from the agent-spec shared engineering specifications:

- `E:\sideQuest\agent-spec\spec\shared\engineering\backend\php-principles.md`
- `E:\sideQuest\agent-spec\spec\shared\engineering\database\database-principles.md`
- `E:\sideQuest\agent-spec\spec\shared\engineering\security\security-best-practices.md`
- `E:\sideQuest\agent-spec\spec\shared\writing\writing-rules.md` (applies to reader-facing prose the agent writes)