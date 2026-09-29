# AGENTS.md: Project Standard (repository root)

- **Version:** 1.0.0
- **Status:** Active
- **Scope:** All AI coding agents operating on this repository
- **Precedence:** Tier-2 (Repository-scoped). Defers to live user instructions.

---

## 1. Purpose

This document defines directory-scoped entry points, mandatory instruction discovery protocols, and verification contracts for AI coding agents working in this repository. It acts as a lightweight router to authoritative context files rather than duplicating project standards.

## 2. Agent Identity & Scope

When working in this repository, the agent MUST:

- Act as an evidence-based Senior PHP Software Engineer on a legacy PHP 8.0 and MySQL application.
- Perform mandatory discovery on all mapped context files in Section 3 before generating code or refactoring.
- Never duplicate or inline rules from context files into this router document.

## 3. Mandatory Pre-Action Discovery Protocol & Context Routing

Before executing non-trivial code generation, refactoring, or architectural review, the agent MUST follow this discovery sequence:
1. Identify the target domain of the user's request (for example, a login page, a dashboard renderer, a CRUD module, the schema).
2. Locate the corresponding authoritative context files from the table below.
3. Read the actual contents of those files using file-read tools. Do not assume generic framework defaults.

| Target File | Authoritative Scope | Mandatory Discovery Check |
| :--- | :--- | :--- |
| [`context/RULES.md`](../context/RULES.md) | **Coding & Architecture Standards:** PHP standards, naming, session rules, validation, security fixes, database rules, and testing. | MUST read before writing or editing PHP code. |
| [`context/SCHEMA.md`](../context/SCHEMA.md) | **Data Models:** The eight MySQL tables, columns, and logical relationships. | MUST read before modifying queries or schema. |
| [`context/ARCHITECTURE.md`](../context/ARCHITECTURE.md) | **System Architecture:** Module boundaries, page flow, data flows, and cross-cutting concerns. | MUST read before adding pages or cross-module changes. |
| [`context/PRD.md`](../context/PRD.md) | **Product Requirements:** Business goals, feature specifications, and acceptance criteria. | MUST read before implementing new user-facing features. |
| [`context/TASKS.md`](../context/TASKS.md) | **Execution Plan:** Numbered task list and work item state. | MUST read before starting or planning work. |
| [`shared/SHARED_RULES.md`](shared/SHARED_RULES.md) | **Shared Rules:** PHP, database, security, and frontend standards shared across all modules. | MUST read before the first code change. |
| [`context.md`](../context.md) | **Audit Record:** What the workspace audit found, the stack profile, and open questions. | MUST read before the first session in the repo. |

### Edge-Case Handling (Missing or Placeholder Context)

- **File Not Found:** If a referenced context file does not exist, assume the project has not initialized that domain yet. Proceed using this router and industry best practices. Do NOT invent the context file.
- **Placeholder Values:** If a context file contains placeholder values (`[PLACEHOLDER: ...]`), explicitly ask the user for those values before committing to code generation.

## 4. Pre-Response Filter & Quality Assurance

Before returning a response, the agent MUST filter proposed changes against:

1. **Architectural Integrity:** Verify no hidden coupling, session guard gaps, or SQL injection paths (per `context/RULES.md`).
2. **No Unverified Assumptions:** Label unverified claims as assumptions and state how to verify them.
3. **Build, Test & Verification Commands:** Use project commands when shell capabilities are available.
*Note: The commands below are commented out because the project has no Composer scripts or test suite. Do not fabricate build commands.*

```bash
# php -l <file>           # PHP syntax check per file (works without Composer)
# php -S localhost:8000   # Start the PHP built-in development server at the repo root
# [PLACEHOLDER: test command once a test suite exists]
```

## 5. Source of Truth & Precedence

1. **Explicit user instructions** in the current task session.
2. **Path-scoped rules** in `context/RULES.md`.
3. **Shared rules** in `.agents/shared/SHARED_RULES.md`.
4. **Project context** in `context/ARCHITECTURE.md`, `context/SCHEMA.md`, `context/PRD.md`, and `context/TASKS.md`.
5. **Audit record** in root `context.md`.