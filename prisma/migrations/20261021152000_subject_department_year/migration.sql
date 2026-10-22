-- Subjects: per department and year level.
-- Departments already exist from 20261021150000_add_departments (ids 1=IT, 2=Education, 3=Agriculture).

-- AlterTable: year level defaults to "Not specified" for legacy rows
ALTER TABLE "Subject" ADD COLUMN "yearLevel" TEXT NOT NULL DEFAULT 'Not specified';

-- AlterTable: nullable department FK
ALTER TABLE "Subject" ADD COLUMN "departmentId" INTEGER REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: legacy subjects belong to the Education Department
UPDATE "Subject" SET "departmentId" = (SELECT "id" FROM "Department" WHERE "name" = 'Education Department') WHERE "departmentId" IS NULL;

-- CreateIndex
CREATE INDEX "Subject_departmentId_idx" ON "Subject"("departmentId");
