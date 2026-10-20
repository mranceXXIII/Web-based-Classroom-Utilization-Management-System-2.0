# Skill Patch — windows-node-toolchain-pitfalls

- **Target:** all agents running Node/npm on Windows hosts · `reference/standards.md` §Environment pitfalls
- **Origin:** run 2026-10-14-sqlite-prisma-ui-unification, E4 + E5 + E7 + E9
- **Status:** Proposed (authored by Leader; verified live in this run)

## Rules (new)

- **R-WIN-1 — Resolve the npm binary explicitly.** On Windows hosts where PowerShell blocks `npm.ps1` (execution policy) or PATH resolves to a malformed shim, do not rely on `npm`/`npx` from PATH. Discover the real path once (`where.exe npm`) and use the full path for every invocation (this run: `G:\npm.cmd`, `G:\npx.cmd`). Record the resolved path in the run's TECH-STACK so every agent uses the same one.
- **R-WIN-2 — Never write JSON config with `Set-Content -Encoding UTF8` on PowerShell 5.1.** It emits a UTF-8 BOM; npm/tsc/other strict JSON parsers then fail with an opaque "Unexpected token '﻿'". Use `[System.IO.File]::WriteAllText($path, $text)` (UTF-8 no BOM) or an editor tool. **Verify** with a parse, not by eye.
- **R-WIN-3 — Expect the 30-second tool timeout.** `npm install`, `next build`, `next dev`, `prisma migrate` all exceed it. Run them via `Start-Process ... -RedirectStandardOutput/-RedirectStandardError <log>` and poll the log files; never block a tool call on them.
- **R-WIN-4 — Avoid piping native-command stderr in PowerShell.** `cmd 2>&1 | Select-Object` produces false `NativeCommandError` noise that looks like a failure. Run the command armed, or capture to a file, then read the file.
- **R-WIN-5 — Prefer `Invoke-WebRequest`/`Invoke-RestMethod` over `curl`.** Inline JSON through `curl` breaks under PowerShell quoting; use `-Body` with here-strings or `--data-binary @file` for real curl.
- **R-WIN-6 — `prisma migrate dev` auto-runs the seed** when `package.json#prisma.seed` is set. Expect seed errors to surface during migration; fix the seed before treating a migration as clean.

## Evidence this run

- BOM: `JSON.parse` failure on `package.json` until the BOM was stripped via `[System.IO.File]::WriteAllText`.
- PATH: `npm.ps1 cannot be loaded because running scripts is disabled`; `Get-Command npm.cmd` → `Source: G:npm.cmd` (malformed) → full path used throughout.
- Timeouts: `npm install` needed ~3 min via background process + log polling.
- False NativeCommandError observed on `G:\npx.cmd prisma --version 2>&1 | Select-Object -First 6`.
