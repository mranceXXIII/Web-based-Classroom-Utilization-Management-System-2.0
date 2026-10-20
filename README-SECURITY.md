# SECURITY README — Deployment gate & dev credentials (FIND-002, CWE-798)

_Run: 2026-10-14-sqlite-prisma-ui-unification · Owner: backend agent · Companion: docs/SECURITY-ASSESSMENT.md (§3 FIND-002), docs/DATA-MODEL.md §Seed_

## ⚠️ Deployment gate (READ BEFORE ANY NON-LOCALHOST EXPOSURE)

The seed script (`prisma/seed.ts`) ships **documented development credentials**:

| Account | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| Admin | `admin` | `admin123` | seeded ADMIN user (bcrypt cost 10) |
| Faculty (10 accounts without a legacy password) | faculty name (e.g. `Angelica Rico`) | `faculty123` | seeded FACULTY users |
| Faculty (6 accounts with legacy hashes) | faculty name | **original legacy passwords (unknown)** | `$2y$` hashes ported verbatim from the legacy DB — rotate via faculty re-registration or admin delete+recreate |

**These MUST be rotated/removed before any deployment beyond `localhost`:**

1. **Never seed defaults in production.** The seed refuses to run with dev passwords when `NODE_ENV=production` — set explicit overrides first:
   - `SEED_ADMIN_PASSWORD` — replaces `admin123`
   - `SEED_FACULTY_PASSWORD` — replaces `faculty123` (applies only to passwordless legacy faculty)
2. Rotate every seeded credential immediately after first production boot (admin UI or re-registration), or delete the seeded accounts and register real ones.
3. Force password reset for the 6 accounts carrying ported legacy `$2y$` hashes (their plaintext is unknown; ~2023-vintage hashes).
4. Bind the dev server to loopback only: `G:\npx.cmd next dev -H 127.0.0.1` (never `0.0.0.0` on shared networks).
5. `AUTH_SECRET` must be a fresh ≥32-char random value per environment (see `.env.example`); rotate on any suspicion of disclosure. JWTs are valid up to 7 days — rotation invalidates them.
6. Enforce HTTPS in production so the session cookie's `Secure` flag binds (LEGAL C5); HSTS belongs at the TLS-terminating layer.
7. `dev.db` contains real names (roster/faculty) — never copy it to shared storage or production (LEGAL C4).

## Reseed (pristine legacy-data state)

```powershell
# from code/ — full path, npm PATH is broken on this machine
G:\npx.cmd prisma migrate dev --name init   # apply schema
G:\npx.cmd prisma db seed                   # wipe + reseed verified legacy data
```

The seed is idempotent (deleteMany + create in one transaction) and restores the documented fixture state: 17 users / 17 faculty / 8 blocks / 28 subjects / 13 rooms / 36 schedules / 6 roster entries.

## Security controls quick reference

- Rate limiting: login lockout — 10 failed attempts per username+IP / 15 min → 429 (`src/lib/rate-limit.ts`, per-process).
- CSRF defense-in-depth: Origin/Sec-Fetch-Site check on POST/PUT/DELETE (`src/lib/api.ts` `checkOrigin`); SameSite=Lax cookie remains primary.
- Security headers: `next.config.ts` (CSP, X-Frame-Options DENY, XCTO, Referrer-Policy, Permissions-Policy). HSTS = TLS layer.
- Full findings & status: `docs/SECURITY-ASSESSMENT.md`.