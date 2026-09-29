# PRD: Product Requirements Document

> **Purpose:** Define the product problem, target audience, scope, technical constraints, and success criteria so developers and AI agents keep implementation strictly within intended bounds. Tier-3 template, filled in for this project.

_Last updated: September 29, 2026_

---

## 1. Executive Summary

**[PLACEHOLDER: A concise 2 to 3 paragraph high-level overview of the product vision, core value proposition, and intended impact.]**

---

## 2. Problem Statement & Context

**[PLACEHOLDER: Explain the specific problem this project solves, for whom it solves it, and why current alternatives are inadequate.]**

**Fact from the audit:** The system tracks classroom and venue utilization for Romblon State University Cajidiocan Campus, Education Department. The code and seed data confirm the scope: blocks, subjects, rooms, schedules, and faculty presence.

---

## 3. Core Goals & Objectives

**[PLACEHOLDER: Enumerate the primary business and user objectives.]**

---

## 4. Target Users & Audience

- **User Roles & Access Levels:** Admin, Faculty, Student (verified in `index.php` and the login pages).
- **Primary Persona:** **[PLACEHOLDER: Name / role, description of main goals and daily workflow]**
- **Secondary Persona:** **[PLACEHOLDER: Name / role, administrative or edge case users]**

---

## 5. MVP Features (Scope)

**[PLACEHOLDER: List the features required for the launch milestone.]**

**Features observed in code (observed, not specified):** role selection with per-role login and registration, admin dashboard with faculty CRUD, blocks, subjects, rooms, and schedule management, schedule lists with CSV export and PDF export, student roster CSV import, and faculty and student utilization views with live status badges and a presence heartbeat.

---

## 6. Full Feature List & Prioritization

**[PLACEHOLDER: Categorize all features using MoSCoW prioritization.]**

### Must-Have (P0: Launch Blockers)

- [ ] **[Feature Name]:** [Feature description and acceptance criteria]

### Should-Have (P1: High Priority Post-MVP)

- [ ] **[Feature Name]:** [Feature description and business value]

### Could-Have (P2: Nice to Have)

- [ ] **[Feature Name]:** [Feature description and enhancement potential]

### Won't-Have (Out of Scope for Current Milestone)

- [ ] **[Feature Name]:** [Features explicitly deferred]

---

## 7. Success Metrics & KPIs

**[PLACEHOLDER: Define measurable signals that prove product success.]**

---

## 8. Tech Stack & Technical Requirements

**Verified stack:**

- **Backend:** PHP 8.0, procedural pages, no framework, no Composer.
- **Database:** MySQL/MariaDB, database `educ_room_utilization`, mixed mysqli and PDO access.
- **Frontend:** Server-rendered HTML, Bootstrap 3.3.7 and 4.0.0 via CDN, jQuery 2.2.0, 3.2.1, and 3.3.1, Font Awesome 5.x, html2pdf.js 0.10.1, local jQuery UI 1.10.4.
- **Auth:** PHP native sessions, bcrypt through `password_hash` and `password_verify`.

---

## 9. Deployment & Infrastructure Strategy

**[PLACEHOLDER: Detail hosting, CI/CD pipeline, and environment setup.]**

**Fact from the audit:** The GitHub Actions workflow (`.github/workflows/symfony.yml`) is a Symfony template. It expects `composer.json`, `.env.test`, PHPUnit, and SQLite, none of which exist, so CI fails as configured.

---

## 10. Phase Roadmap

**[PLACEHOLDER: Outline the milestone timeline.]**