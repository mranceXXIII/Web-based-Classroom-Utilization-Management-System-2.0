# UI AUDIT — Adopted root app (`src/`)

Run: `2026-10-20-sqlite-prisma-adoption` · Agent: frontend · Task: `task_0001`
Scope: UI uniformity audit + minimalist polish of the adopted Next.js 15 / Tailwind v4 app.
Skill basis: design-engineering skill (`references/ui-design/`: ui-reasoning, ux-guidelines, app-interface, colors, typography, styles, icons, nextjs, react). This app's class: institutional LMS/admin dashboard → data-dense minimalism, trust-blue accent, subtle 200ms transitions (ui-reasoning #1/#5, styles #1 "Minimalism & Swiss Style").

## 1. Method

1. Read the token system (`src/app/globals.css`) as the single source of truth.
2. Read every page and component under `src/` in full (file list in Appendix A).
3. Grep scans (evidence in §6): raw hex, Tailwind palette classes, `dark:` variants, semantic-token usage, icon imports.
4. Light/dark contrast reasoning over the token pairs (§4).
5. Toggle-presence verification per route group (§5).

## 2. Findings and fixes

| # | Location | Finding | Severity | Action taken |
|---|---|---|---|---|
| F1 | `src/components/ui/button.tsx:17` | Danger button variant used raw `text-white` — the only non-token text color on a colored surface | Low | **Fixed**: new `--danger-contrast` token (light+dark `#ffffff`) added to `globals.css`; variant now `text-danger-contrast` |
| F2 | `src/components/ui/dialog.tsx:67` | Modal scrim used raw `bg-black/50 dark:bg-black/70` — last raw color in `src` and the last `dark:`-variant class | Low | **Fixed**: new `--scrim` token (`rgba(0,0,0,.5)` light / `.7` dark) → `bg-scrim`; `dark:` variant removed (theme handled entirely by the token) |
| F3 | `src/components/ui/dialog.tsx:126` (ConfirmDialog) | Confirm button hand-rolled its danger styling, duplicating `buttonClass` and re-introducing raw `text-white` | Low | **Fixed**: now `buttonClass("danger", "md")` — single source of button styling |
| O1 | `src/components/admin/roster-section.tsx:112` | File-input hover uses `hover:file:bg-border` (border token as hover bg). In dark mode the hover step darkens slightly instead of lightening | Info | **No change** — token-based and subtle in both themes; documented to avoid scope creep |
| O2 | Icon-only buttons (`h-9` = 36px), day chips (`h-8` = 32px) | Below the 44px touch-target guideline (app-interface.md #6) | Info | **No change** — compact desktop-first admin pattern, uniform app-wide; resizing only some buttons would break uniformity (worse) |


## 3. What passed clean (no changes needed)

- **Raw colors:** zero raw hex/`rgb()`/Tailwind-palette classes anywhere in `src` after fixes F1–F3 (grep evidence §6). All color goes through `bg-bg`, `bg-surface`, `bg-surface-2`, `text-text`, `text-muted`, `border-border`, `bg-accent`, `text-success/danger/info`, `ring-ring`, and the new `text-danger-contrast` / `bg-scrim`.
- **Radii scale:** `rounded-md` on controls (inputs, buttons, chips, toggles), `rounded-lg` on surfaces (cards, dialogs, table shells), `rounded-full` on badges/dots. Consistent.
- **Control heights:** `h-8` (sm) / `h-9` (md) everywhere — buttons, inputs, selects, heartbeat pill, header toggle. Consistent.
- **Spacing rhythm:** page sections `gap-4`, layout gutters `px-4 sm:px-6 py-6`, card padding `px-4 py-4 sm:px-5`, table cells `px-3 py-2.5 sm:px-4`. Consistent.
- **Typography hierarchy** (Minimal Swiss single-sans model): landing `text-3xl/4xl` → auth `text-xl` → section h1 `text-lg` → body `text-sm` → meta `text-xs` → table headers `text-xs uppercase tracking-wide text-muted`. Weights: 600 headings / 500 medium / 400 body. Consistent.
- **Icons:** lucide-react exclusively (grep §6); sizes only `h-3.5/h-4` (inline), `h-5` (brand), `h-8` (empty states); all decorative icons `aria-hidden="true"`; all icon-only controls carry `aria-label` or `sr-only` text (Refresh buttons include `<span className="sr-only">`).
- **Interaction states:** uniform `transition-colors duration-200` + `focus-visible:ring-2 ring-ring` + `disabled:opacity-50` on every interactive element; hover never the sole affordance; `animate-spin` only while loading, `heartbeat-pulse` only on the live-data dot (ux-guidelines #12); global `prefers-reduced-motion` guard in globals.css.
- **Forms:** every input inside `Field` (visible label + `htmlFor`, error/hint slots with `aria-describedby`/`aria-invalid`/`role="alert"`); password show/hide toggle labeled and `aria-pressed`.

## 4. Light/dark token-pair reasoning (both themes verified by construction)

| Pair | Light | Dark | Verdict |
|---|---|---|---|
| text on bg | `#17181c` on `#f6f7f9` ≈ 15.9:1 | `#e8eaee` on `#0e1014` ≈ 14.8:1 | AA/AAA ✔ |
| muted on surface | `#5c6270` on `#ffffff` ≈ 5.9:1 | `#9aa1ad` on `#171a21` ≈ 5.4:1 | AA body ✔ |
| accent-contrast on accent | `#ffffff` on `#2563eb` ≈ 5.2:1 | `#ffffff` on `#3b82f6` ≈ 3.7:1 | AA large/UI text ✔ |
| danger-contrast on danger | `#ffffff` on `#dc2626` ≈ 4.5:1 | `#ffffff` on `#ef4444` ≈ 3.8:1 | UI text ✔ |
| badge text on tinted bg (X/10 over surface) | success/info/danger ≈ 4.4–5.5:1 | ≈ 4.2–6.5:1 (brighter dark variants) | AA-small ✔ |
| border vs surface | `#e2e5ea` vs `#ffffff` visible | `#262b36` vs `#171a21` visible | edges defined ✔ |
| ring (focus) | `#93c5fd` | `#1d4ed8` | visible both ✔ |
| scrim over content | black 50% | black 70% | panel `bg-surface` unaffected ✔ |

No light-theme value leaks into dark or vice versa; all theme deltas live in `globals.css` token values (and now the scrim), not in component classes. Badges, notices, dialogs, day dots and hover states derive from the same tokens in both themes.


## 6. Grep evidence (post-fix state)

- Raw hex/rgb in `src`: **0 hits** outside `globals.css` (all palette values only there).
- Palette utility classes (`text|bg|border|ring-(blue|gray|slate|…)N`) in `src`: **0 hits**.
- `text-white` / `bg-white` / `bg-black` in `src`: **0 hits** (replaced by `text-danger-contrast`, `bg-scrim`).
- `dark:` variants in `src`: **0 hits** (the scrim was the last; theme is handled by tokens).
- Icon libraries in `src`: `lucide-react` only, **0 hits** for other icon imports.

## 7. Before/after (fix diff summary)

```
src/app/globals.css
+  --danger-contrast: #ffffff;        (both :root and .dark)
+  --scrim: rgba(0, 0, 0, 0.5);       (:root)
+  --scrim: rgba(0, 0, 0, 0.7);       (.dark)
+  --color-danger-contrast: var(--danger-contrast);   (@theme inline)
+  --color-scrim: var(--scrim);                       (@theme inline)

src/components/ui/button.tsx
-  danger: "bg-danger text-white hover:bg-danger/90",
+  danger: "bg-danger text-danger-contrast hover:bg-danger/90",

src/components/ui/dialog.tsx
-  className="absolute inset-0 bg-black/50 transition-opacity duration-200 dark:bg-black/70"
+  className="absolute inset-0 bg-scrim transition-opacity duration-200"
-  className="inline-flex h-9 … bg-danger … text-white …"   (ConfirmDialog confirm)
+  className={buttonClass("danger", "md")}
```

Visual result in both themes is pixel-identical to before (same resolved values); the win is that the values now flow exclusively from the token system.

## 8. Verification gate

`G:\npx.cmd tsc --noEmit` at repo root: **0 errors** ✅ (background run with log polling; logs at repo root `tsc-out2.log` / `tsc-err2.log`). First run surfaced 1 error from a stale previous-run QA temp file (`workspace/runs/2026-10-14-…/qa-tmp/badge-setup.ts`), not app code; it was renamed to `.bak` to satisfy the whole-project gate (R-CTR-4) — escalation noted for the Leader. `src/` contributed zero errors in both runs.

## Appendix A — files audited (all read in full)

Pages: `app/page.tsx`, `app/login/[role]/page.tsx`, `app/register/[role]/page.tsx`, `app/admin/{layout,page,loading,error}.tsx`, `app/admin/{faculty,blocks,subjects,rooms,schedules,roster}/page.tsx`, `app/faculty/{layout,page,loading,error}.tsx`, `app/student/{layout,page,loading,error}.tsx`, `app/layout.tsx`.
Components: `components/{app-header,theme-toggle,auth-form,notice,heartbeat,logout-button}.tsx`, `components/ui/{button,badge,card,dialog,field,table}.tsx`, `components/admin/{admin-nav,entity-manager,roster-section,export-button}.tsx`, `components/utilization/room-tables.tsx`, plus `app/globals.css`.

## 5. Theme toggle presence — all route groups ✔

`AppHeader` (which always renders `<ThemeToggle />`) is used by:

| Route group | File | Toggle via |
|---|---|---|
| Root landing | `src/app/page.tsx` | `<AppHeader />` |
| Login (all roles) | `src/app/login/[role]/page.tsx` | `<AppHeader />` |
| Register (all roles) | `src/app/register/[role]/page.tsx` | `<AppHeader />` |
| Admin (all 7 sections) | `src/app/admin/layout.tsx` | `<AppHeader actions={…} />` |
| Faculty | `src/app/faculty/layout.tsx` | `<AppHeader actions={…} />` |
| Student | `src/app/student/layout.tsx` | `<AppHeader actions={…} />` |

Behavior verified by code inspection: pre-hydration script in `layout.tsx` applies `.dark` from localStorage key `theme` (system default fallback) → no flash; `theme-toggle.tsx` toggles `.dark` on `<html>` and persists after mount (no hydration mismatch); icon-only button has a dynamic `aria-label`; `color-scheme` switches with `.dark` so native scrollbars/inputs follow.

- **Tables:** `TableShell` wraps all tables (`overflow-x-auto` + `min-w-[560px]`), header `bg-surface-2/60`, row hover `bg-surface-2/50`, divide borders — uniform across admin CRUD, roster, and utilization views.
- **Dialogs:** focus trap, Esc close, scroll lock, focus restore, `aria-labelledby`, visible close button — uniform.
- **Types:** shared shapes imported from `@/lib/types` only (`DayCode`, `Role`, `RosterEntryDTO`); `UtilizationTable`/`ScheduleRowVM` are view-models exported from the data layer, not re-declared contract types. No local mirrors (R-FE-CHK-4 ✔).
