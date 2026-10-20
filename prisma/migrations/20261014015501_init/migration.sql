-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FacultyProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "academicRank" TEXT NOT NULL DEFAULT 'Not specified',
    "advisory" TEXT NOT NULL DEFAULT 'None',
    "lastHeartbeat" DATETIME,
    "userId" INTEGER,
    CONSTRAINT "FacultyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Block" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "yearLevel" TEXT NOT NULL,
    "advisorId" INTEGER,
    CONSTRAINT "Block_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "FacultyProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "semester" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "days" TEXT NOT NULL,
    "facultyId" INTEGER,
    "blockId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Schedule_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Schedule_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Schedule_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Schedule_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RosterEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "blockId" INTEGER,
    CONSTRAINT "RosterEntry_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyProfile_name_key" ON "FacultyProfile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyProfile_userId_key" ON "FacultyProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_name_key" ON "Block"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_description_key" ON "Subject"("description");

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");

-- CreateIndex
CREATE INDEX "Schedule_roomId_semester_idx" ON "Schedule"("roomId", "semester");

-- CreateIndex
CREATE INDEX "Schedule_facultyId_idx" ON "Schedule"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "RosterEntry_name_blockId_key" ON "RosterEntry"("name", "blockId");
