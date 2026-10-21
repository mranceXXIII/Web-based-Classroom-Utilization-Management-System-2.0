-- Add Department grouping to blocks.
-- Departments seeded here so the backfill below has deterministic targets;
-- the application seed (prisma/seed.ts) is idempotent and re-asserts them.

-- CreateTable
CREATE TABLE "Department" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- Default departments (insertion order fixes ids: 1=IT, 2=Education, 3=Agriculture)
INSERT INTO "Department" ("name") VALUES ('IT Department'), ('Education Department'), ('Agriculture Department');

-- AlterTable: add the nullable FK column (no default required for nullable)
ALTER TABLE "Block" ADD COLUMN "departmentId" INTEGER REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: legacy blocks belong to the Education Department
UPDATE "Block" SET "departmentId" = (SELECT "id" FROM "Department" WHERE "name" = 'Education Department') WHERE "departmentId" IS NULL;

-- CreateIndex
CREATE INDEX "Block_departmentId_idx" ON "Block"("departmentId");
