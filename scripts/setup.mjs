// scripts/setup.mjs — first-run bootstrap so the system is functional right
// after `npm install` (wired as part of the postinstall hook):
//   1. create .env from .env.example if missing (random 64-hex AUTH_SECRET)
//   2. `prisma migrate deploy` — apply the committed migrations (creates tables)
//   3. seed the legacy data, but only when the database is still empty
//        (prisma/seed.ts skips itself when users exist, so this is idempotent)
// Never fails the install: any problem is printed with the manual fix instead.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const envPath = path.join(root, ".env");
const prismaBin = path.join(root, "node_modules", "prisma", "build", "index.js");
const tsxCli = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");

function run(cmd, args, label) {
  console.log(`[setup] ${label} ...`);
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root });
  if (res.status !== 0) {
    console.error(`[setup] "${label}" failed with exit code ${res.status}.`);
    console.error("[setup] You can run it manually with: npm run setup");
  }
  return res.status === 0;
}

try {
  // 1. .env bootstrap
  if (!existsSync(envPath)) {
    const secret = randomBytes(32).toString("hex");
    const example = readFileSync(path.join(root, ".env.example"), "utf8");
    const env = example
      .replace(/AUTH_SECRET=.*/, `AUTH_SECRET="${secret}"`);
    writeFileSync(envPath, env, "utf8");
    console.log("[setup] Created .env with a generated AUTH_SECRET (random, 64 hex chars).");
  } else {
    console.log("[setup] .env already exists — keeping it.");
  }

  // 2. migrations (no-op when already applied)
  if (!existsSync(prismaBin)) {
    console.error("[setup] prisma CLI not found — run `npm install` first.");
    process.exit(0);
  }
  run(process.execPath, [prismaBin, "migrate", "deploy"], "Applying database migrations (prisma migrate deploy)");

  // 3. seed (guard inside prisma/seed.ts skips when users exist)
  if (existsSync(tsxCli)) {
    run(process.execPath, [tsxCli, "prisma/seed.ts"], "Seeding legacy data (skips if already seeded)");
  } else {
    console.error("[setup] tsx not found — seed skipped. Run `npm run db:seed` after install.");
  }

  console.log("[setup] Done. Start the system with: npm run dev  →  http://localhost:3000");
} catch (err) {
  console.error("[setup] Unexpected error (install not failed):", err);
  console.error("[setup] Fix manually with: npm run setup");
}
