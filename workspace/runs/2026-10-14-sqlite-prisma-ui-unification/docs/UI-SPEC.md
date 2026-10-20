# UI-SPEC — Frontend Design Specification

_Run: 2026-10-14-sqlite-prisma-ui-unification · Owner: frontend agent · Scope: src/app/{page,login,register,admin,faculty,student}, src/components/**, token values in src/app/globals.css_

---

## 1. Design language (user mandate: uniform, clean, MINIMALIST)

One design language on every page, derived from the design-engineering skill:

- **Style:** Minimalism & Swiss (styles.md #1) — generous whitespace, grid-based cards/tables, no decorative shadows/gradients/tickers (FR-031), essential elements only.
- **Typography:** "Minimal Swiss" single-family hierarchy (typography.md #5). Font stack `Inter, "SF Pro Text", "Segoe UI Variable", "Segoe UI", system-ui…` (see §6 D1 — `next/font` needs a layout.tsx edit, which is outside frontend ownership). Hierarchy: page title `text-lg font-semibold tracking-tight`, card title `text-base font-semibold`, body `text-sm`, meta/labels `text-xs`. Tabular numerals for times/counts.
- **Color:** token-only (no raw hex in components). Restrained palette: bg/surface/surface-2 neutrals + single accent (blue) + success/danger/info status colors (colors.md minimalism guidance + Leader-frozen token block preserved).
- **Motion:** micro-interactions only, 150–300ms `transition-colors duration-200`; looping animation exclusively for the live heartbeat dot; global `prefers-reduced-motion` guard.
- **Icons:** lucide-react, 16px in controls / 20px in brand, decorative icons `aria-hidden`, icon-only buttons always carry `aria-label` (icons.md fallback rule → single library, uniform stroke, per TECH-STACK.md pin).
- **Dark/light:** `.dark` class on `<html>`, pre-hydration script (root layout, Leader-authored), toggle persists `localStorage.theme`, defaults to system; body color transition 200ms; all tokens re-mapped in `.dark` (no light-theme grays reused — app-interface.md #29).

## 2. Tokens (src/app/globals.css — token VALUES only refined; structure untouched)

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--bg` / `bg-bg` | #f6f7f9 | #0e1014 | page background |
| `--surface` / `bg-surface` | #ffffff | #171a21 | cards, tables, header, dialogs |
| `--surface-2` / `bg-surface-2` | #eef0f3 | #1f232d | table header, hover fills, skeletons |
| `--text` / `text-text` | #17181c | #e8eaee | primary text |
| `--muted` / `text-muted` | #5c6270 | #9aa1ad | secondary text, inactive nav |
| `--border` / `border-border` | #e2e5ea | #262b36 | 1px hairlines, table dividers |
| `--accent` / `bg-accent` | #2563eb | #3b82f6 | primary actions, active nav, presence dots |
| `--accent-contrast` | #ffffff | #ffffff | text on accent |
| `--success` | #16a34a | #22c55e | ACTIVE badge, heartbeat ok |
| `--danger` | #dc2626 | #ef4444 | VACANT/UNAVAILABLE badges, errors, delete |
| `--info` | #0284c7 | #38bdf8 | INACTIVE badge, info notices |
| `--ring` / `ring-ring` | #93c5fd | #1d4ed8 | focus-visible rings (AA in both themes) |

**Status badge map (user-mandated):** ACTIVE→success, INACTIVE→info, VACANT→danger, UNAVAILABLE→danger, NO_FACULTY→muted. Labels come from the canonical `statusFunc` port (src/lib/status.ts) — badge colors are presentation-only.

Additions to globals.css beyond token values (logged as D2): Inter-first font stack, 200ms body color transition, `@keyframes heartbeat-pulse` + `.heartbeat-pulse`, `prefers-reduced-motion` kill-switch.

## 3. Component inventory (src/components/**)

### Primitives (uniform shapes — FR-030)

| Component | File | Contract |
| --- | --- | --- |
| `Button` / `buttonClass()` | ui/button.tsx | variants primary/secondary/ghost/danger; sizes sm(h-8)/md(h-9); `loading` shows spinner; focus ring `ring-ring` offset `ring-offset-bg` |
| `Field` | ui/field.tsx | visible label + htmlFor, required mark, hint, `role="alert"` error slot; render-prop exposes `{id, describedBy, invalid}` |
| `Input`, `Select`, `PasswordInput` | ui/field.tsx | h-9 rounded-md border; invalid→danger border; PasswordInput has accessible show/hide toggle |
| `Badge` / `StatusBadge` / `DayDots` | ui/badge.tsx | pill, border+10% tint; status map per §2; DayDots = day-initial chips |
| `TableShell/THead/TBody/TR/TH/TD` | ui/table.tsx | `overflow-x-auto` shell (FR-034), uppercase 11px headers on surface-2, hover rows, divide-y |
| `Card` + Header/Title/Description/Content/Footer | ui/card.tsx | rounded-lg border surface; header/footer hairlines |
| `Dialog` / `ConfirmDialog` | ui/dialog.tsx | client; overlay z-50, focus trap, Esc, restore focus, body scroll lock, visible close button, aria-modal |
| `Notice` / `EmptyState` / `SkeletonRows` | notice.tsx | error (role=alert)/info/success/muted; empty states explain + offer action; skeletons prevent layout shift |

### System components

| Component | File | Notes |
| --- | --- | --- |
| `ThemeToggle` | theme-toggle.tsx | client; toggles `.dark`, persists `theme`; label "Switch to dark/light theme" |
| `AppHeader` | app-header.tsx | sticky brand header on **every** page; `actions` slot; server component |
| `LogoutButton` | logout-button.tsx | client; POST /api/auth/logout then hard nav `/` (FR-007) |
| `Heartbeat` | heartbeat.tsx | client; polls /api/heartbeat every 60s, AbortController + interval cleanup, pulsing ok-dot, `aria-live="polite"` (FR-022) |
| `AdminNav` | admin/admin-nav.tsx | client; usePathname active state, `aria-current="page"` |
| `EntityManager<T>` | admin/entity-manager.tsx | generic CRUD: list + Add/Edit dialog + delete confirm over `/api/crud/{entity}` (GET/POST/PUT body.id/DELETE ?id=); field types text/select/time/days; days→`DayCode[]` wire; numericKeys coercion; degraded banner + retry |
| `RosterSection` | admin/roster-section.tsx | CSV import (multipart, field `file`) with created/updated/skipped summary + per-row errors; table + delete |
| `ExportSchedulesButton` | admin/export-button.tsx | anchor → /api/export/schedules, `download` (FR-015) |
| `AuthForm` | auth-form.tsx | one form, role×mode; inline `fields` errors from envelope; success → role dashboard |
| `RoomTables` | utilization/room-tables.tsx | FR-020/021: card per room, rows=schedules, MON..SUN presence dots, StatusBadge column |

### Data seam

| File | Role |
| --- | --- |
| `api-client.ts` | client fetch → envelope; `ApiError{status, fields}`; network failure → friendly message |
| `data.ts` | server loaders: try live `/api/*` (2.5s timeout) → fallback mocks + `degraded` flag; utilization built with canonical `buildRoomTables`/`scheduleStatusBadge`/`getQuarter` |
| `mocks.ts` | UI constants (DAY_CODES/DAY_LABELS/SEMESTERS) + SAMPLE data only (marked); types imported from `@/lib/types` |

## 4. Page-by-page layout decisions

- **`/` (FR-001):** AppHeader; centered intro block (eyebrow, H1, one paragraph) + 3 equal role cards (icon tile, title, description, "Sign in →" affordance, whole card clickable via Link); thin footer. Static.
- **`/login/[role]`, `/register/[role]` (FR-002..006):** AppHeader; single centered `AuthForm` (max-w-sm). Role-specific register copy states the gate (roster / existing record / cap 3). Register faculty/admin use an existing-name select; student gets name + block select (block NAME per API-CONTRACT) + password. Unknown role → notFound(). Static.
- **`/admin/**` (FR-012..015):** AppHeader (logout) + sidebar nav (Overview, Faculty, Blocks, Subjects, Rooms, Schedules, Roster; horizontal scroll <md). Overview = 6 stat cards linking to sections. Each CRUD section = title/description + actions (Export CSV on schedules, refresh, Add) + uniform table + dialog forms. Schedules form: block/subject/room/faculty selects (faculty optional → "None (no faculty)" sentinel 0), semester select, two `type="time"` pickers (HH:MM 24h), day chip multi-select MON..SUN. Roster: import card + table. All `force-dynamic`.
- **`/faculty` (FR-020..022):** AppHeader with Logout + `Heartbeat` in header; page title with current semester; `RoomTables` (one Card per room). `force-dynamic` (time-sensitive).
- **`/student` (FR-023):** identical utilization view, no heartbeat; same badges (legacy parity). `force-dynamic`.
- **Responsive (FR-034):** tables scroll horizontally (min-w-[560px]) instead of breaking; admin nav → scrollable chips; cards stack ≤sm; header condenses; verified classes down to 360px.

## 5. Skill-application notes (evidence)

| Skill source | Applied |
| --- | --- |
| styles.md #1 Minimalism/Swiss | token table §2, no gradients/decorative shadows, uniform hairlines, grid layouts |
| typography.md #5 Minimal Swiss | single family, weight-based hierarchy, tabular-nums for times/counts |
| colors.md | restrained token palette; single accent; status color semantics |
| icons.md (+TECH-STACK pin) | lucide-react only, `aria-hidden` decorative, labels on icon-only buttons |
| ux-guidelines #3/#7/#8/#9/#10/#15/#90 | active nav, few animated elements, 150–300ms, reduced-motion, loading skeletons, z-50 scale, empty states with guidance |
| app-interface.md #1/#2/#11/#19/#29 | icon button labels, htmlFor labels, dialog escape affordances, password toggle, dark contrast tokens |
| nextjs.md #5/#6/#7/#8/#9 | loading.tsx/error.tsx per section, server components default, client leaves, force-dynamic live reads |
| react.md #6/#7/#9/#10/#45/#46/#47/#49 | heartbeat cleanup + deps, mountedRef pattern, stable id keys, aria-live, htmlFor, typed props/handlers |

## 6. Deviations & cross-boundary notes

- **D1 — fonts:** `next/font` (Inter) requires editing `src/app/layout.tsx` (backend-owned). CSS stack ships instead. **Request to Leader:** add `next/font/google` Inter with `variable --font-inter` in layout.tsx; globals.css will adopt it.
- **D2 — globals.css additions:** base font/transition/pulse/reduced-motion rules appended after the token block (structure untouched) — design-system concerns with no other home in frontend ownership.
- **D3 — degraded-mode UX:** when the API is unreachable, admin lists/dashboards show clearly-labeled SAMPLE data (banner) rather than empty shells, per the parallel-build mandate; mutations surface real API errors inline. With the backend live, banners disappear automatically.
- **Integration note:** server loaders self-fetch `/api/*` (briefing-mandated seam). If the Leader prefers direct Prisma reads (API-CONTRACT.md sanctions `db` + `@/lib/serialize`), swap only inside `data.ts` — no page changes.


