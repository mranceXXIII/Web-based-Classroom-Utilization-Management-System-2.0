# LICENSE-AUDIT — RSU Classroom Utilization 2.0 (SQLite + Prisma + UI Unification)

_Run: 2026-10-14-sqlite-prisma-ui-unification · Owner: Legal/Compliance Agent · Audit date: 2026-10-14 · Scope: the installed dependency tree under `runs/2026-10-14-sqlite-prisma-ui-unification/code/node_modules`_

## 0. Method and evidence standard (R3)

- **Every license claim below was read from files on disk** — no claim is made from memory or from a registry. For each package, the `license` field of the **installed** `package.json` was extracted (bulk PowerShell extraction over all top-level, scoped, and nested directories of `code/node_modules`, with the file path recorded per package), and for all 17 direct dependencies the first lines of the actual `LICENSE*` file were read as corroboration.
- Installed versions differ from the caret ranges in `code/package.json` (resolved later at install). This audit therefore audits **what is actually installed**; `code/package-lock.json` exists and pins the tree.
- Dependency parentage (which transitive arrived via which direct dependency) was extracted from each installed package's `dependencies`/`optionalDependencies` fields.
- A recursive scan for nested `node_modules` copies found exactly 3 (all MIT): `next/node_modules/postcss`, `nypm/node_modules/citty`, `pkg-types/node_modules/confbox`.

## 1. Verdict summary

| Group | Count | License families | Verdict |
| :--- | ---: | :--- | :--- |
| Direct runtime deps | 8 | MIT ×6, ISC ×1, Apache-2.0 ×1 | COMPATIBLE |
| Direct dev deps | 9 | MIT ×7, Apache-2.0 ×2 | COMPATIBLE |
| Transitive top-level packages (whole tree incl. the above) | 85 | 61 MIT · 12 Apache-2.0 · 4 ISC · 2 BSD-3-Clause · 1 BSD-2-Clause · 1 0BSD · 1 CC-BY-4.0 · 2 MPL-2.0 · 1 "Apache-2.0 AND LGPL-3.0-or-later" | COMPATIBLE with 3 flags (§3) |
| Nested duplicate installs | 3 | MIT ×3 | COMPATIBLE |

- **No GPL, AGPL, SSPL, or unknown-license package exists anywhere in the installed tree.** Every installed `package.json` carried a machine-readable `license` field.
- The only copyleft component is an **optional, app-unused prebuilt binary** (`@img/sharp-win32-x64`, dual Apache-2.0/LGPL-3.0-or-later — §3.1). The only attribution obligation is `caniuse-lite` (CC-BY-4.0 — §3.2). `lightningcss` (MPL-2.0, weak file-level copyleft) is build-time tooling (§3.3).
- **Overall license verdict: CLEAR-WITH-CONDITIONS.** License-side condition: ship `code/THIRD-PARTY-NOTICES.md` (content list in §6) before any distribution or production cutover. Full condition list: `docs/LEGAL-COMPLIANCE-REVIEW.md` §5.

## 2. Direct dependencies — per-dependency verdicts

Type key: *permissive* = MIT / ISC / BSD / Apache-2.0 / 0BSD. Compatibility basis: **private, internal educational use by Romblon State University** — no distribution of builds to third parties, no resale/SaaS offering. Paths are relative to `code/`.

### 2.1 Runtime dependencies (8)

| # | Package | Manifest → installed | License identifier (evidence) | Type | Internal-use compatibility | Attribution obligations | Verdict |
| :-- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `next` | `^15.1.0` → **15.5.27** | MIT — `node_modules/next/package.json`; `node_modules/next/license.md` line 1: "The MIT License (MIT)" | permissive | Compatible | Retain license/copyright notice in distribution | **PASS** |
| 2 | `react` | `^19.0.0` → **19.3.0** | MIT — `node_modules/react/package.json`; `node_modules/react/LICENSE` line 1: "MIT License" | permissive | Compatible | Retain notice | **PASS** |
| 3 | `react-dom` | `^19.0.0` → **19.3.0** | MIT — `node_modules/react-dom/package.json`; `node_modules/react-dom/LICENSE` line 1: "MIT License" | permissive | Compatible | Retain notice | **PASS** |
| 4 | `@prisma/client` | `^6.2.1` → **6.19.3** | Apache-2.0 — `node_modules/@prisma/client/package.json`; `node_modules/@prisma/client/LICENSE` line 1: "Apache License" | permissive | Compatible | Apache-2.0 §4(d): keep LICENSE/NOTICE text; state changes if source-modified | **PASS** |
| 5 | `bcryptjs` | `^2.4.3` → **2.4.3** | `package.json` field: MIT. `LICENSE` file (read in full, 50 lines): *bcrypt.js* portion = permissive BSD-3-Clause-style text (© 2012 Nevins Bartolomeo, © 2012 Shane Girish, © 2014 Daniel Wirtz; retain-notice / reproduce-notice / no-endorsement clauses); *isaac.js* portion = MIT (© 2012 Yves-Marie K. Rinquin) | permissive | Compatible — MIT and BSD-3 are both permissive; the field-vs-file discrepancy is a packaging quirk, not a copyleft risk | Retain the copyright notice lines above | **PASS** (nuance recorded) |
| 6 | `jose` | `^5.9.6` → **5.10.0** | MIT — `node_modules/jose/package.json`; `node_modules/jose/LICENSE.md` line 1: "The MIT License (MIT)" | permissive | Compatible | Retain notice | **PASS** |
| 7 | `zod` | `^3.24.1` → **3.25.76** | MIT — `node_modules/zod/package.json`; `node_modules/zod/LICENSE` line 1: "MIT License"; **zero runtime dependencies** (verified in its `package.json`) | permissive | Compatible | Retain notice | **PASS** |
| 8 | `lucide-react` | `^0.468.0` → **0.468.0** | ISC — `node_modules/lucide-react/package.json`; `node_modules/lucide-react/LICENSE` line 1: "ISC License" | permissive | Compatible | ISC permission notice retention | **PASS** |

### 2.2 Dev dependencies (9)

| # | Package | Manifest → installed | License identifier (evidence) | Type | Internal-use compatibility | Attribution obligations | Verdict |
| :-- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 9 | `prisma` | `^6.2.1` → **6.19.3** | Apache-2.0 — `node_modules/prisma/package.json`; `node_modules/prisma/LICENSE` line 1: "Apache License" | permissive | Compatible (CLI/ORM, build/dev-time) | Apache-2.0 §4(d) NOTICE retention | **PASS** |
| 10 | `tailwindcss` | `^4.0.0` → **4.3.3** | MIT — `node_modules/tailwindcss/package.json`; `node_modules/tailwindcss/LICENSE` line 1: "MIT License" | permissive | Compatible | Retain notice | **PASS** |
| 11 | `@tailwindcss/postcss` | `^4.0.0` → **4.3.3** | MIT — `node_modules/@tailwindcss/postcss/package.json`; `LICENSE` line 1: "MIT License" | permissive | Compatible | Retain notice | **PASS** |
| 12 | `tsx` | `^4.19.2` → **4.23.15** | MIT — `node_modules/tsx/package.json`; `node_modules/tsx/LICENSE` line 1: "MIT License" | permissive | Compatible | Retain notice | **PASS** |
| 13 | `typescript` | `^5.7.2` → **5.9.3** | Apache-2.0 — `node_modules/typescript/package.json`; `node_modules/typescript/LICENSE.txt` line 1: "Apache License" | permissive | Compatible | Apache-2.0 §4(d) NOTICE retention | **PASS** |
| 14 | `@types/bcryptjs` | `^2.4.6` → **2.4.6** | MIT — `node_modules/@types/bcryptjs/package.json` | permissive | Compatible | Retain notice | **PASS** |
| 15 | `@types/node` | `^22.10.2` → **22.20.5** | MIT — `node_modules/@types/node/package.json` | permissive | Compatible | Retain notice | **PASS** |
| 16 | `@types/react` | `^19.0.2` → **19.3.0** | MIT — `node_modules/@types/react/package.json` | permissive | Compatible | Retain notice | **PASS** |
| 17 | `@types/react-dom` | `^19.0.2` → **19.3.0** | MIT — `node_modules/@types/react-dom/package.json` | permissive | Compatible | Retain notice | **PASS** |

## 3. Flags (copyleft, attribution, and unusual items)

### 3.1 `@img/sharp-win32-x64` 0.35.5 — license field **"Apache-2.0 AND LGPL-3.0-or-later"**
- Evidence: `node_modules/@img/sharp-win32-x64/package.json` (read directly); parent `sharp` 0.35.5 is Apache-2.0 (`node_modules/sharp/package.json`) and is itself an **optional** dependency of `next` (`next` package.json optionalDependencies, read from installed tree).
- What it is: the Windows prebuilt binary binding that bundles the native image library (libvips, LGPL-3.0) used by sharp for image optimization.
- **App usage: none.** Verified: `code/src` contains no `next/image` or `<Image>` usage and there is **no `public/` directory**; the package is present only because npm installs `next`'s optional deps by default.
- LGPL-3.0 assessment for RSU private internal use: no obligation to release application source; obligations attach mainly on **distribution** (provide LGPL license text, allow replacement of the library). Internal use = no additional burden beyond notice retention.
- Verdict: **COMPATIBLE** (flagged; no action needed for internal use; include in notices if builds are ever distributed).

### 3.2 `caniuse-lite` 1.0.30001816 — **CC-BY-4.0** (attribution required)
- Evidence: `node_modules/caniuse-lite/package.json` (read directly). Arrives via `next` (dependency of Next.js browserslist tooling).
- What it is: browser-support **data**, consumed at build time only; never shipped to end users.
- Obligation: attribution — include credit (data from caniuse.com, © Alexis Deveria, CC-BY-4.0) in the third-party notices file. CC-BY-4.0 is not copyleft for code purposes; compatible.
- Verdict: **COMPATIBLE — attribution condition (C1).**

### 3.3 `lightningcss` 1.32.0 + `lightningcss-win32-x64-msvc` 1.32.0 — **MPL-2.0** (weak, file-level copyleft)
- Evidence: both `package.json` files (read directly). Arrives via `@tailwindcss/node` (installed parentage map).
- MPL-2.0 keeps only the MPL-licensed *files* open; applications that merely link/use it at build time carry no source-disclosure obligation. Used here as a build-time CSS engine; unmodified.
- Verdict: **COMPATIBLE** (retain notices).

### 3.4 Other notable (no action)
- `tslib` 2.8.1 — **0BSD** (public-domain-equivalent; no obligation). Evidence: `node_modules/tslib/package.json`.
- BSD family: `dotenv` 16.6.1 (BSD-2-Clause), `deepmerge-ts` 7.1.5 + `source-map-js` 1.2.2 (BSD-3-Clause) — permissive, notice retention.
- `bcryptjs` field-vs-file nuance — see §2.1 row 5 (both readings are permissive).
- **Zero** GPL/AGPL/SSPL/unknown licenses in all 88 installed package manifests (85 top-level + scoped + 3 nested).

## 4. Notable transitive dependencies (parent-attributed)

Parentage read from each installed package's `dependencies` / `optionalDependencies` fields. All verdicts **PASS** unless flagged (§3).

| Transitive | Installed | License (evidence: its `package.json`) | Pulled in by | Note |
| :--- | :--- | :--- | :--- | :--- |
| `@next/env` | 15.5.27 | MIT (`node_modules/@next/env/package.json`, read in full) | next | dotenv-loading helper |
| `@next/swc-win32-x64-msvc` | 15.5.27 | MIT | next (optional) | SWC compiler binary |
| `@swc/helpers` | 0.5.15 | Apache-2.0 | next → `tslib` (0BSD) | |
| `styled-jsx` 5.1.6 → `client-only` 0.0.1 | MIT / MIT | next | |
| `caniuse-lite` | 1.0.30001816 | **CC-BY-4.0** | next | **Attribution — §3.2** |
| `postcss` (top-level) | 8.5.30 | MIT | @tailwindcss/postcss → `nanoid` 3.3.20 (MIT), `picocolors` 1.1.1 (ISC), `source-map-js` 1.2.2 (BSD-3) | |
| `postcss` (nested) | 8.4.31 | MIT | `next/node_modules/postcss/package.json` (nested copy) | |
| `sharp` | 0.35.5 | Apache-2.0 | next (optional) → `@img/colour` 1.1.0 (MIT), `detect-libc` 2.1.2 (Apache-2.0), `semver` 7.8.5 (ISC), `@img/sharp-win32-x64` 0.35.5 (**Apache-2.0 AND LGPL-3.0-or-later** — §3.1) | App-unused (no `next/image`) |
| `@tailwindcss/node` | 4.3.3 | MIT | @tailwindcss/postcss → `@jridgewell/remapping` 2.3.5 + `gen-mapping` 0.3.13 + `trace-mapping` 0.3.31 + `sourcemap-codec` 1.6.0 + `resolve-uri` 3.1.2 (all MIT), `enhanced-resolve` 5.26.0 (MIT → `graceful-fs` 4.2.11 ISC, `tapable` 2.3.3 MIT), `jiti` 2.7.0 (MIT), `magic-string` 0.30.21 (MIT), `source-map-js` (BSD-3), `lightningcss` (MPL-2.0 — §3.3) | |
| `@tailwindcss/oxide` (+ `-win32-x64-msvc`) | 4.3.3 | MIT | @tailwindcss/postcss | Native scanner binary |
| `@alloc/quick-lru` | 5.3.0 | MIT | @tailwindcss/postcss | |
| `@prisma/config` | 6.19.3 | Apache-2.0 | prisma → `c12` 3.1.0 (MIT → `chokidar` 4.0.3 MIT → `readdirp` 4.1.2 MIT; `confbox` 0.2.4 MIT; `defu` 6.1.7 MIT; `dotenv` 16.6.1 BSD-2; `exsolve` 1.1.3 MIT; `giget` 2.0.0 MIT → `citty` 0.1.6 MIT → `consola` 3.4.2 MIT, `node-fetch-native` 1.6.7 MIT, `nypm` 0.6.10 MIT → `tinyexec` 1.3.1 MIT; `pathe` 2.0.3 MIT; `ohash` 2.0.12 MIT; `perfect-debounce` 1.0.0 MIT; `pkg-types` 2.3.3 MIT; `rc9` 2.1.2 MIT), `deepmerge-ts` 7.1.5 (BSD-3), `effect` 3.21.0 (MIT → `@standard-schema/spec` 1.1.0 MIT, `fast-check` 3.23.2 MIT → `pure-rand` 6.1.0 MIT), `empathic` 2.0.0 (MIT) | effect/fast-check lineage arrives via Prisma, **not** zod |
| `@prisma/engines` (+ `-version`, `-fetch-engine`, `-get-platform`, `-debug`) | 6.19.3 (engines-version 7.1.1-3) | Apache-2.0 (all) | prisma | Engine binaries downloaded at install from `binaries.prisma.sh` (host string verified in installed `node_modules/prisma/build/index.js`) |
| `scheduler` | 0.28.0 | MIT | react-dom | |
| `esbuild` (+ `@esbuild/win32-x64`) | 0.28.2 | MIT | tsx | Build tool |
| Nested: `citty` 0.2.2, `confbox` 0.3.1 | MIT | `nypm/node_modules/citty`, `pkg-types/node_modules/confbox` | Duplicate nested installs |

## 5. Complete installed-tree inventory (85 top-level + 3 nested)

Every entry: name @ installed version — license read from `code/node_modules/<path>/package.json`. Grouped by license family.

**MIT (61):** bcryptjs 2.4.3 · c12 3.1.0 · chokidar 4.0.3 · citty 0.1.6 · client-only 0.0.1 · confbox 0.2.4 · consola 3.4.2 · csstype 3.2.3 · defu 6.1.7 · destr 2.0.5 · effect 3.21.0 · empathic 2.0.0 · enhanced-resolve 5.26.0 · esbuild 0.28.2 · exsolve 1.1.3 · fast-check 3.23.2 · giget 2.0.0 · jiti 2.7.0 · jose 5.10.0 · magic-string 0.30.21 · nanoid 3.3.20 · next 15.5.27 · node-fetch-native 1.6.7 · nypm 0.6.10 · ohash 2.0.12 · pathe 2.0.3 · perfect-debounce 1.0.0 · pkg-types 2.3.3 · postcss 8.5.30 · pure-rand 6.1.0 · rc9 2.1.2 · react 19.3.0 · react-dom 19.3.0 · readdirp 4.1.2 · scheduler 0.28.0 · styled-jsx 5.1.6 · tailwindcss 4.3.3 · tapable 2.3.3 · tinyexec 1.3.1 · tsx 4.23.15 · undici-types 6.21.0 · zod 3.25.76 · @alloc/quick-lru 5.3.0 · @esbuild/win32-x64 0.28.2 · @img/colour 1.1.0 · @jridgewell/gen-mapping 0.3.13 · @jridgewell/remapping 2.3.5 · @jridgewell/resolve-uri 3.1.2 · @jridgewell/sourcemap-codec 1.6.0 · @jridgewell/trace-mapping 0.3.31 · @next/env 15.5.27 · @next/swc-win32-x64-msvc 15.5.27 · @standard-schema/spec 1.1.0 · @tailwindcss/node 4.3.3 · @tailwindcss/oxide 4.3.3 · @tailwindcss/oxide-win32-x64-msvc 4.3.3 · @tailwindcss/postcss 4.3.3 · @types/bcryptjs 2.4.6 · @types/node 22.20.5 · @types/react 19.3.0 · @types/react-dom 19.3.0

**Apache-2.0 (12):** detect-libc 2.1.2 · prisma 6.19.3 · sharp 0.35.5 · typescript 5.9.3 · @prisma/client 6.19.3 · @prisma/config 6.19.3 · @prisma/debug 6.19.3 · @prisma/engines 6.19.3 · @prisma/engines-version 7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7 · @prisma/fetch-engine 6.19.3 · @prisma/get-platform 6.19.3 · @swc/helpers 0.5.15

**ISC (4):** graceful-fs 4.2.11 · lucide-react 0.468.0 · picocolors 1.1.1 · semver 7.8.5

**BSD-3-Clause (2):** deepmerge-ts 7.1.5 · source-map-js 1.2.2  |  **BSD-2-Clause (1):** dotenv 16.6.1  |  **0BSD (1):** tslib 2.8.1

**CC-BY-4.0 (1):** caniuse-lite 1.0.30001816 *(attribution — §3.2)*  |  **MPL-2.0 (2):** lightningcss 1.32.0 · lightningcss-win32-x64-msvc 1.32.0 *(§3.3)*  |  **Apache-2.0 AND LGPL-3.0-or-later (1):** @img/sharp-win32-x64 0.35.5 *(§3.1)*

**Nested duplicates, MIT (3):** postcss 8.4.31 (`next/node_modules/postcss/package.json`) · citty 0.2.2 (`nypm/node_modules/citty/package.json`) · confbox 0.3.1 (`pkg-types/node_modules/confbox/package.json`)

## 6. Attribution obligations and recommended action

1. Create **`code/THIRD-PARTY-NOTICES.md`** containing: the LICENSE text of all 17 direct dependencies; the caniuse-lite attribution ("includes browser data from caniuse.com, © Alexis Deveria, licensed CC-BY-4.0"); Apache-2.0 LICENSE/NOTICE text for prisma, @prisma/client, typescript, @swc/helpers, detect-libc, sharp; MPL-2.0 notice for lightningcss; the bcryptjs dual notice (§2.1 row 5). Trigger: **before any distribution or production cutover** (condition C1 in LEGAL-COMPLIANCE-REVIEW §5). Pure internal development does not yet require it, but it is cheap insurance and satisfies every permissive-license notice clause in one file.
2. **Re-run this audit on any dependency change.** Caret ranges already drifted (e.g. `next ^15.1.0` → 15.5.27, `prisma ^6.2.1` → 6.19.3, `typescript ^5.7.2` → 5.9.3); future installs may pull different versions with different transitive trees (condition C8).

## 7. Evidence appendix

- Manifest: `code/package.json` (read in full — 8 runtime + 9 dev deps, prisma seed via tsx).
- Bulk license extraction: PowerShell walk of `code/node_modules` (top-level dirs, `@scope/*` subdirs, recursive nested scan to depth 3) → `name | version | license | path` for all 88 manifests; every path cited in this document is of the form `code/node_modules/<name>/package.json` unless explicitly nested.
- LICENSE-file first-line reads for all 17 direct deps (§2 tables); full read of `node_modules/bcryptjs/LICENSE` (50 lines) and `node_modules/@next/env/package.json`.
- Lockfile present: `code/package-lock.json` (verified via filesystem check).
- No network/registry lookups were used for any license claim.

_Audit complete — 2026-10-14 · Legal/Compliance Agent · Verdict: CLEAR-WITH-CONDITIONS (C1/C8 license-side; full list in `LEGAL-COMPLIANCE-REVIEW.md` §5)._