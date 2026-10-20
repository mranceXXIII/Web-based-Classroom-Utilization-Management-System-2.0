# POST-SHIP FIXES — 2026-10-20 (post-adoption defect found by live browser use)

_Reported by the user: "can't proceed to the main system after login." Root-caused and fixed; verified live; tsc 0 errors; production build pass._

## Fix 1 — CSP blocked ALL client JS in dev (the login blocker) · next.config.ts

**Symptom:** Login page renders, but clicking "Sign in" does nothing — user never reaches
the dashboard. All server-side tests passed because they never execute browser JS.

**Root cause:** `next dev` compiles client chunks with eval-based source maps and runs
React Refresh (verified: `main-app.js` and page chunks contain `eval()`). The CSP was
`script-src 'self' 'unsafe-inline'` — no `'unsafe-eval'` — so the browser refused to run
every client script: React never hydrated, and the login form's client-side submit was
dead. SSR-only HTML still rendered, which is why the failure was invisible to HTTP tests.

**Fix:** `script-src` gains `'unsafe-eval'` and `connect-src` gains `ws: wss:` (dev HMR
websocket) **only when `NODE_ENV !== "production"`**. Production builds contain no eval
and keep the strict policy.

## Fix 2 — Server-side data fetches were unauthenticated · src/components/data.ts

**Symptom:** Even after login, dashboards showed wrong data (e.g. admin overview counted
8 faculty instead of 18; faculty ranks/advisories were sample values).

**Root cause:** `tryApi()` fetched the internal CRUD API without forwarding the request's
cookies → role-guarded GETs returned 401 → the documented fallback to mock sample data
kicked in silently.

**Fix:** forward the incoming `cookie` header in `tryApi()` so server components read
through the API as the logged-in user.

## Fix 3 — Read authorization didn't match who legitimately reads · CRUD routes

Mutations stay ADMIN-only. GET paths adjusted to their real consumers:
- `/api/crud/schedules` GET → any authenticated role (faculty/student dashboards FR-020/FR-023).
- `/api/crud/faculty` GET → public read (registration name dropdowns FR-005/FR-006 run
  pre-auth; read-only directory data the legacy system also published publicly).
- `/api/crud/blocks` GET → public read (student registration block dropdown FR-004).
- rooms/subjects/roster GETs remain admin-only (least privilege; not used pre-auth).

## Verification (2026-10-20, live)

- Dev CSP header contains `'unsafe-eval'` → client JS hydrates (login form functional).
- `GET /api/crud/blocks` and `/api/crud/faculty` unauthenticated → 200 (registration dropdowns work).
- `GET /admin` with admin session → faculty count **18** (real data; mock was 8); logout button present.
- `GET /faculty` with fresh faculty session → 1.2 MB live utilization HTML, semester "1st Sem",
  no "Sample data" fallback notice.
- `tsc --noEmit` → 0 errors. `next build` (clean, no concurrent dev server) → compiled
  successfully, full route table.
- Operational note: don't run `next build` while `next dev` is active — they share `.next`
  and the build stalls in static generation (observed live; killed and re-ran cleanly).
