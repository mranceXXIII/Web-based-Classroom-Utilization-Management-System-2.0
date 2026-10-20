# TECH-STACK — Pinned Choices

_Run: 2026-10-14-sqlite-prisma-ui-unification · Owner: Team Leader_

| Concern | Choice | Why |
| :--- | :--- | :--- |
| Framework | Next.js 15 (App Router) + TypeScript | One app for API + UI; server components cut client JS; matches design-engineering `stacks/nextjs.md` |
| ORM / DB | Prisma + SQLite (file DB) | User mandate; zero external DB service on Windows |
| Styling | Tailwind CSS v4 + CSS custom-property tokens | Minimalist token system; dark mode via `.dark` class strategy |
| Icons | lucide-react | Tree-shakable, uniform stroke icons (design-engineering `tokens/icons.md`) |
| Validation | zod | Typed schema validation at API boundary |
| Auth | `jose` (JWT) + `bcryptjs` | Pure-JS; bcryptjs verifies legacy `$2y$` hashes; no native builds |
| Heartbeat | `setInterval` client fetch (60s) | Matches legacy polling model; no websockets |
| Seed | `prisma/seed.ts` via `prisma db seed` | Reproducible verified legacy data |
| Package manager | npm via **`G:\npm.cmd`** (full path; shell PATH broken) | Environment constraint |

## Commands (Windows)

```powershell
G:\npm.cmd install
G:\npx.cmd prisma migrate dev --name init
G:\npx.cmd prisma db seed
G:\npm.cmd run build
G:\npm.cmd run dev        # http://localhost:3000
```

## Environment

`.env` (gitignored): `DATABASE_URL="file:./dev.db"`, `AUTH_SECRET=<openssl rand -hex 32>`. `.env.example` lists both with placeholders.
