// prisma/seed.ts — carries verified legacy data forward (db/educ_room_utilization.sql, read-only source).
// Idempotent: deleteMany + create inside one transaction.
//
// Conventions (documented in docs/DATA-MODEL.md):
//  - Legacy times "HH:MM:SS" → "HH:MM". Day color columns ('green' = class day) → comma-joined DayCode list.
//  - table_sched row 49 has faculty 'None' → Schedule without faculty (facultyId null).
//  - Schedule rows referencing blocks='BTLED' (ids 1,2,3,5,7): 'BTLED' is not in blocks_detail (7 rows),
//    so an 8th schedule-integrity block "BTLED" (yearLevel "Not specified") is seeded to keep the exact
//    legacy display text and FK integrity.
//  - exprimental_studentlist rows have block='' → RosterEntry.blockId = null (no block recorded).
//  - Faculty with legacy '$2y$' bcrypt hashes keep them verbatim (bcryptjs verifies $2y$);
//    faculty without passwords get the dev password "faculty123" + User accounts.
//  - Heartbeat timestamps ported verbatim as Asia/Manila local instants (+08:00).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// FIND-002 deployment gate (SECURITY-ASSESSMENT.md §3): dev defaults are refused in production
// unless explicit overrides are provided via env. Dev behavior is unchanged.
function resolveDevPasswords(): { admin: string; faculty: string } {
  const envAdmin = process.env.SEED_ADMIN_PASSWORD;
  const envFaculty = process.env.SEED_FACULTY_PASSWORD;
  if (process.env.NODE_ENV === "production" && (!envAdmin || !envFaculty)) {
    throw new Error(
      "Refusing to seed default dev credentials in production (FIND-002). " +
        "Set SEED_ADMIN_PASSWORD and SEED_FACULTY_PASSWORD (see README-SECURITY.md)."
    );
  }
  return { admin: envAdmin ?? "admin123", faculty: envFaculty ?? "faculty123" };
}

const BCRYPT_COST = 10;
const DEV_PASSWORDS = resolveDevPasswords();
const DEV_FACULTY_PASSWORD = DEV_PASSWORDS.faculty;
const DEV_ADMIN_USERNAME = "admin";
const DEV_ADMIN_PASSWORD = DEV_PASSWORDS.admin;

const LEGACY_HASH_REGEX = /^\$2[aby]\$/;

type FacultySeed = {
  name: string;
  academicRank: string;
  advisory: string;
  passwordHash: string | null; // null → dev password
  isLegacyHash?: boolean;
  lastHeartbeat: string; // ISO with +08:00
  isAdminProfile?: boolean;
};

// Legacy it_faculty rows (Name, Academic_Rank, Advisory, password, timestamp).
// timestamp is legacy Asia/Manila wall-clock; stored with +08:00 offset.
const facultySeed: FacultySeed[] = [
  { name: "Admin", academicRank: "Not specified", advisory: "None", passwordHash: null, lastHeartbeat: "2023-10-02T13:18:51+08:00", isAdminProfile: true },
  { name: "Gerardo Ribon", academicRank: "Instructor III", advisory: "None", passwordHash: "$2y$10$jKZ/bFkUDOPRPdjhSnMDa.COTxIzBMulQ1xNbfpeaEQqdlLXuzy/6", isLegacyHash: true, lastHeartbeat: "2023-09-27T14:44:53+08:00" },
  { name: "Clara Jean Juanzo", academicRank: "Instructor I", advisory: "None", passwordHash: "$2y$10$WXYGTLBKIuj.0c5/wHkqqetfi3Gr.Xg1lBeYo.Sh54KO1s3Ds2A4a", isLegacyHash: true, lastHeartbeat: "2023-09-27T14:43:14+08:00" },
  { name: "Angelica Rico", academicRank: "Lecturer", advisory: "None", passwordHash: null, lastHeartbeat: "2023-09-25T08:57:13+08:00" },
  { name: "Raymund Ipedro", academicRank: "Instructor I", advisory: "None", passwordHash: "$2y$10$8HZ0aivzyDETDa2wQWSC3uG53Zc4GIz9paNnDRsFQymyNSceDFeKe", isLegacyHash: true, lastHeartbeat: "2023-10-03T02:42:03+08:00" },
  { name: "Ma Lourdes Rivero", academicRank: "Lecturer", advisory: "None", passwordHash: null, lastHeartbeat: "2023-09-25T08:58:53+08:00" },
  { name: "Ezekiel Roa", academicRank: "Lecturer", advisory: "None", passwordHash: null, lastHeartbeat: "2023-09-25T08:59:33+08:00" },
  { name: "Marco Rivas", academicRank: "Lecturer", advisory: "None", passwordHash: null, lastHeartbeat: "2023-09-25T09:00:21+08:00" },
  { name: "Reynaldo Catajay", academicRank: "Instructor I", advisory: "None", passwordHash: "$2y$10$F0/CMRXnaVYaMPZ/0Ubj2e7vUg.3y6UdChKyWABwjgxC2mLCVMB5u", isLegacyHash: true, lastHeartbeat: "2023-10-03T02:43:23+08:00" },
  { name: "Jasmin Rotoni", academicRank: "Lecturer", advisory: "None", passwordHash: null, lastHeartbeat: "2023-09-25T09:01:29+08:00" },
  { name: "Debbie Bacalso", academicRank: "Lecturer", advisory: "None", passwordHash: null, lastHeartbeat: "2023-09-25T09:03:52+08:00" },
  { name: "Abegail Rojo", academicRank: "Lecturer", advisory: "None", passwordHash: "$2y$10$RxprZ64XZlomtmyl9Hms..JSztpSM2Kk02ON5sBaQ1nJJZ0IeqOzS", isLegacyHash: true, lastHeartbeat: "2023-10-03T02:38:51+08:00" },
  { name: "Carren May Juanzo", academicRank: "Lecturer", advisory: "None", passwordHash: "$2y$10$.lZwl5JTbWzvwylJ1eUq6.zPFHEK6h2YRqtIiFDmNTK3xIhvHDReu", isLegacyHash: true, lastHeartbeat: "2023-10-03T04:23:32+08:00" },
  { name: "Cheliza Rabusa", academicRank: "Lecturer", advisory: "None", passwordHash: null, lastHeartbeat: "2023-09-25T15:59:03+08:00" },
  { name: "Romeylene Rabino", academicRank: "Lecturer", advisory: "None", passwordHash: null, lastHeartbeat: "2023-09-26T05:09:07+08:00" },
  { name: "Jodel Adremesin", academicRank: "Lecturer", advisory: "None", passwordHash: null, lastHeartbeat: "2023-09-26T09:53:29+08:00" },
  { name: "Jelmar Faalam", academicRank: "Lecturer", advisory: "None", passwordHash: null, lastHeartbeat: "2023-09-26T09:54:06+08:00" },
];

// blocks_detail (name, year_level, advisor='None' → no advisor) + schedule-integrity "BTLED".
const blocksSeed: { name: string; yearLevel: string }[] = [
  { name: "BSED 3 ENGLISH", yearLevel: "3rd year" },
  { name: "BSED 3 SCIENCE", yearLevel: "3rd year" },
  { name: "BSED 3 MATHEMATICS", yearLevel: "3rd year" },
  { name: "BEED 3", yearLevel: "3rd year" },
  { name: "BTLED 3", yearLevel: "3rd year" },
  { name: "Combined BSED 3  SCIENCE and MATHEMATICS", yearLevel: "3rd year" }, // double space preserved from dump
  { name: "Combine BTLED and BEED 3", yearLevel: "3rd year" },
  { name: "BTLED", yearLevel: "Not specified" }, // schedule-integrity block (see file header)
];

// exprimental_studentlist (Name, block='') — all without block.
const rosterSeed: { name: string }[] = [
  { name: "Juan Dela Cruz" },
  { name: "Ako ay Student" },
  { name: "Mark Joshua Rance" },
  { name: "Rogen Ramilo" },
  { name: "Arth Roi Castillo" },
  { name: "Duane Jaynn Gaytano" },
];

// rooms (room)
const roomsSeed: string[] = [
  "201", "Backstage", "Defense Room", "205", "Canteen", "203", "202",
  "103", "102 - OSAS Office", "206", "Covered Court", "Stage", "none",
];

// subject (subject_description) — subject_code dropped per frozen data model.
const subjectsSeed: string[] = [
  "Facilitating Learner Centered Teaching",
  "Assessment in Learning 1",
  "Technology for Teaching and Learning 1",
  "Teaching and Assessment of Literature Studies",
  "Survey of English and American Literature",
  "Contemporary, Popular, and Emergent Literature",
  "Campus Journalism",
  "Genetics",
  "Biochemistry",
  "Thermodynamics",
  "Waves and Optics",
  "Environmental Science",
  "Calculus 3",
  "Modern Geometry",
  "Linear Algebra",
  "Advanced Statistics",
  "Content and Pedagogy for the Mother Tongue",
  "Teaching English in the Elementary Grades (Language)",
  "Technology for Teaching and Learning in the Elementary Grades",
  "Teaching in English in the Elementary Grades through Literature",
  "Edukasyong Pantahanan at Pangkabuhayan",
  "Technology in Language Education",
  "Agri-Fishery Part I",
  "Entrepreneurship",
  "Fundamentals of Food Technology",
  "Clothing Selection, Purchase and Care",
  "Arts in Daily Living",
  "Methods of Research",
];

// table_sched — faculty null = legacy 'None' (row 49). Times converted HH:MM:SS → HH:MM.
type SchedSeed = {
  faculty: string | null; block: string; subject: string; room: string;
  days: string; startTime: string; endTime: string; semester: string;
};

// Days helper: Monday..Sunday green flags → comma-joined DayCode subset.
function daysOf(m: number, t: number, w: number, th: number, f: number, sa = 0, su = 0): string {
  const codes = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const flags = [m, t, w, th, f, sa, su];
  return codes.filter((_, i) => flags[i] === 1).join(",");
}

const schedulesSeed: SchedSeed[] = [
  { faculty: "Debbie Bacalso", block: "BTLED", subject: "Arts in Daily Living", room: "Canteen", days: daysOf(1, 0, 1, 0, 1), startTime: "09:01", endTime: "10:00", semester: "1st Sem" },
  { faculty: "Debbie Bacalso", block: "BTLED", subject: "Entrepreneurship", room: "Canteen", days: daysOf(0, 1, 0, 1, 0), startTime: "13:01", endTime: "14:30", semester: "1st Sem" },
  { faculty: "Abegail Rojo", block: "BTLED", subject: "Clothing Selection, Purchase and Care", room: "103", days: daysOf(1, 0, 1, 0, 1), startTime: "14:01", endTime: "15:00", semester: "1st Sem" },
  { faculty: "Angelica Rico", block: "Combine BTLED and BEED 3", subject: "Facilitating Learner Centered Teaching", room: "201", days: daysOf(1, 0, 1, 0, 1), startTime: "15:01", endTime: "16:00", semester: "1st Sem" },
  { faculty: "Carren May Juanzo", block: "BTLED", subject: "Fundamentals of Food Technology", room: "Canteen", days: daysOf(0, 1, 0, 1, 0), startTime: "10:31", endTime: "12:00", semester: "1st Sem" },
  { faculty: "Cheliza Rabusa", block: "Combine BTLED and BEED 3", subject: "Technology for Teaching and Learning 1", room: "201", days: daysOf(1, 0, 1, 0, 1), startTime: "16:01", endTime: "17:00", semester: "1st Sem" },
  { faculty: "Clara Jean Juanzo", block: "BTLED", subject: "Methods of Research", room: "Defense Room", days: daysOf(1, 0, 1, 0, 1), startTime: "10:01", endTime: "11:00", semester: "1st Sem" },
  { faculty: "Raymund Ipedro", block: "Combine BTLED and BEED 3", subject: "Assessment in Learning 1", room: "Canteen", days: daysOf(0, 1, 0, 1, 0), startTime: "14:31", endTime: "16:00", semester: "1st Sem" },
  { faculty: "Gerardo Ribon", block: "BSED 3 MATHEMATICS", subject: "Advanced Statistics", room: "Defense Room", days: daysOf(1, 0, 1, 0, 1), startTime: "09:01", endTime: "10:00", semester: "1st Sem" },
  { faculty: "Angelica Rico", block: "BSED 3 MATHEMATICS", subject: "Facilitating Learner Centered Teaching", room: "Defense Room", days: daysOf(1, 0, 1, 0, 1), startTime: "13:01", endTime: "14:00", semester: "1st Sem" },
  { faculty: "Gerardo Ribon", block: "BSED 3 ENGLISH", subject: "Assessment in Learning 1", room: "203", days: daysOf(1, 0, 1, 0, 1), startTime: "13:01", endTime: "14:00", semester: "1st Sem" },
  { faculty: "Angelica Rico", block: "BSED 3 ENGLISH", subject: "Facilitating Learner Centered Teaching", room: "203", days: daysOf(1, 0, 1, 0, 1), startTime: "14:01", endTime: "15:00", semester: "1st Sem" },
  { faculty: "Clara Jean Juanzo", block: "BSED 3 ENGLISH", subject: "Technology in Language Education", room: "206", days: daysOf(1, 0, 1, 0, 1), startTime: "11:01", endTime: "12:00", semester: "1st Sem" },
  { faculty: "Clara Jean Juanzo", block: "BSED 3 ENGLISH", subject: "Survey of English and American Literature", room: "203", days: daysOf(1, 0, 1, 0, 1), startTime: "15:01", endTime: "16:00", semester: "1st Sem" },
  { faculty: "Reynaldo Catajay", block: "BSED 3 ENGLISH", subject: "Contemporary, Popular, and Emergent Literature", room: "203", days: daysOf(1, 0, 1, 0, 1), startTime: "16:01", endTime: "17:00", semester: "1st Sem" },
  { faculty: "Cheliza Rabusa", block: "BSED 3 ENGLISH", subject: "Technology for Teaching and Learning 1", room: "202", days: daysOf(0, 1, 0, 1, 0), startTime: "09:01", endTime: "10:30", semester: "1st Sem" },
  { faculty: "Cheliza Rabusa", block: "BSED 3 MATHEMATICS", subject: "Technology for Teaching and Learning 1", room: "102 - OSAS Office", days: daysOf(1, 0, 1, 0, 1), startTime: "15:01", endTime: "16:00", semester: "1st Sem" },
  { faculty: "Raymund Ipedro", block: "BSED 3 MATHEMATICS", subject: "Linear Algebra", room: "102 - OSAS Office", days: daysOf(1, 0, 1, 0, 1), startTime: "10:01", endTime: "11:00", semester: "1st Sem" },
  { faculty: "Raymund Ipedro", block: "BSED 3 MATHEMATICS", subject: "Assessment in Learning 1", room: "102 - OSAS Office", days: daysOf(0, 1, 0, 1, 0), startTime: "14:01", endTime: "15:00", semester: "1st Sem" },
  { faculty: "Angelica Rico", block: "BSED 3 SCIENCE", subject: "Facilitating Learner Centered Teaching", room: "202", days: daysOf(1, 0, 1, 0, 1), startTime: "13:01", endTime: "14:00", semester: "1st Sem" },
  { faculty: "Raymund Ipedro", block: "BSED 3 SCIENCE", subject: "Assessment in Learning 1", room: "202", days: daysOf(1, 0, 1, 0, 1), startTime: "14:01", endTime: "15:00", semester: "1st Sem" },
  { faculty: "Gerardo Ribon", block: "BSED 3 SCIENCE", subject: "Technology for Teaching and Learning 1", room: "202", days: daysOf(1, 0, 1, 0, 1), startTime: "15:01", endTime: "16:00", semester: "1st Sem" },
  { faculty: "Jasmin Rotoni", block: "BSED 3 SCIENCE", subject: "Genetics", room: "202", days: daysOf(0, 1, 0, 1, 0), startTime: "13:01", endTime: "16:00", semester: "1st Sem" },
  { faculty: "Reynaldo Catajay", block: "BSED 3 SCIENCE", subject: "Thermodynamics", room: "Backstage", days: daysOf(1, 0, 1, 0, 1), startTime: "08:01", endTime: "10:00", semester: "1st Sem" },
  { faculty: "Jasmin Rotoni", block: "BSED 3 SCIENCE", subject: "Biochemistry", room: "202", days: daysOf(0, 1, 0, 1, 0), startTime: "07:31", endTime: "09:00", semester: "1st Sem" },
  { faculty: "Reynaldo Catajay", block: "BSED 3 SCIENCE", subject: "Environmental Science", room: "Backstage", days: daysOf(0, 1, 0, 1, 0), startTime: "10:31", endTime: "12:00", semester: "1st Sem" },
  { faculty: "Jasmin Rotoni", block: "BSED 3 SCIENCE", subject: "Waves and Optics", room: "Backstage", days: daysOf(1, 0, 1, 0, 1), startTime: "10:01", endTime: "12:00", semester: "1st Sem" },
  { faculty: "Romeylene Rabino", block: "BSED 3 ENGLISH", subject: "Teaching and Assessment of Literature Studies", room: "203", days: daysOf(0, 1, 0, 1, 0), startTime: "13:01", endTime: "15:00", semester: "1st Sem" },
  { faculty: "Clara Jean Juanzo", block: "BSED 3 ENGLISH", subject: "Campus Journalism", room: "203", days: daysOf(0, 1, 0, 1, 0), startTime: "15:31", endTime: "17:00", semester: "1st Sem" },
  { faculty: "Gerardo Ribon", block: "BSED 3 MATHEMATICS", subject: "Calculus 3", room: "Defense Room", days: daysOf(0, 1, 0, 0, 0), startTime: "13:01", endTime: "16:00", semester: "1st Sem" },
  { faculty: "Gerardo Ribon", block: "BSED 3 MATHEMATICS", subject: "Modern Geometry", room: "Defense Room", days: daysOf(0, 0, 0, 1, 0), startTime: "13:01", endTime: "16:00", semester: "1st Sem" },
  { faculty: "Ma Lourdes Rivero", block: "BEED 3", subject: "Content and Pedagogy for the Mother Tongue", room: "Stage", days: daysOf(1, 0, 1, 0, 1), startTime: "13:01", endTime: "14:00", semester: "1st Sem" },
  { faculty: "Ezekiel Roa", block: "BEED 3", subject: "Teaching English in the Elementary Grades (Language)", room: "Backstage", days: daysOf(1, 0, 1, 0, 1), startTime: "14:01", endTime: "15:00", semester: "1st Sem" },
  { faculty: "Ezekiel Roa", block: "BEED 3", subject: "Technology for Teaching and Learning in the Elementary Grades", room: "Backstage", days: daysOf(0, 1, 0, 1, 0), startTime: "13:01", endTime: "14:30", semester: "1st Sem" },
  { faculty: "Ma Lourdes Rivero", block: "BEED 3", subject: "Teaching in English in the Elementary Grades through Literature", room: "Backstage", days: daysOf(0, 1, 0, 1, 0), startTime: "07:31", endTime: "09:00", semester: "1st Sem" },
  { faculty: null, block: "BEED 3", subject: "Edukasyong Pantahanan at Pangkabuhayan", room: "none", days: daysOf(1, 0, 1, 0, 1), startTime: "12:01", endTime: "14:00", semester: "1st Sem" },
];

async function main() {
  console.log("Seeding legacy data from db/educ_room_utilization.sql ...");

  await db.$transaction(async (tx) => {
    // Wipe in FK-safe order (idempotent reseed).
    await tx.schedule.deleteMany();
    await tx.rosterEntry.deleteMany();
    await tx.block.deleteMany();
    await tx.facultyProfile.deleteMany();
    await tx.user.deleteMany();
    await tx.subject.deleteMany();
    await tx.room.deleteMany();

    // --- Users (admin + faculty) ---
    const adminUser = await tx.user.create({
      data: {
        username: DEV_ADMIN_USERNAME,
        passwordHash: bcrypt.hashSync(DEV_ADMIN_PASSWORD, BCRYPT_COST),
        role: "ADMIN",
      },
    });

    const facultyUsers = new Map<string, number>(); // profile name → user id
    for (const f of facultySeed) {
      if (f.isAdminProfile) continue; // 'Admin' profile links to the ADMIN user (legacy ci-collation relationship)
      const hash =
        f.passwordHash && f.isLegacyHash && LEGACY_HASH_REGEX.test(f.passwordHash)
          ? f.passwordHash // port legacy $2y$ hash verbatim (bcryptjs verifies it)
          : bcrypt.hashSync(DEV_FACULTY_PASSWORD, BCRYPT_COST);
      const u = await tx.user.create({
        data: { username: f.name, passwordHash: hash, role: "FACULTY" },
      });
      facultyUsers.set(f.name, u.id);
    }

    // --- Faculty profiles ---
    const facultyIds = new Map<string, number>();
    for (const f of facultySeed) {
      const profile = await tx.facultyProfile.create({
        data: {
          name: f.name,
          academicRank: f.academicRank,
          advisory: f.advisory,
          lastHeartbeat: new Date(f.lastHeartbeat),
          userId: f.isAdminProfile ? adminUser.id : facultyUsers.get(f.name) ?? null,
        },
      });
      facultyIds.set(f.name, profile.id);
    }

    // --- Subjects / Rooms ---
    for (const description of subjectsSeed) {
      await tx.subject.create({ data: { description } });
    }
    const roomIds = new Map<string, number>();
    for (const name of roomsSeed) {
      const r = await tx.room.create({ data: { name } });
      roomIds.set(name, r.id);
    }

    // --- Blocks (advisor 'None' in dump → advisorId null) ---
    const blockIds = new Map<string, number>();
    for (const b of blocksSeed) {
      const blk = await tx.block.create({ data: { name: b.name, yearLevel: b.yearLevel, advisorId: null } });
      blockIds.set(b.name, blk.id);
    }

    // --- Roster (block '' → blockId null) ---
    for (const r of rosterSeed) {
      await tx.rosterEntry.create({ data: { name: r.name, blockId: null } });
    }

    // --- Schedules ---
    for (const s of schedulesSeed) {
      const facultyId = s.faculty ? facultyIds.get(s.faculty) : null;
      if (s.faculty && !facultyId) throw new Error(`Seed: unknown faculty '${s.faculty}'`);
      const blockId = blockIds.get(s.block);
      if (!blockId) throw new Error(`Seed: unknown block '${s.block}'`);
      const subject = await tx.subject.findUnique({ where: { description: s.subject } });
      if (!subject) throw new Error(`Seed: unknown subject '${s.subject}'`);
      const roomId = roomIds.get(s.room);
      if (!roomId) throw new Error(`Seed: unknown room '${s.room}'`);
      await tx.schedule.create({
        data: {
          semester: s.semester,
          startTime: s.startTime,
          endTime: s.endTime,
          days: s.days,
          facultyId,
          blockId,
          subjectId: subject.id,
          roomId,
        },
      });
    }
  });

  const [users, profiles, blocks, subjects, rooms, schedules, roster] = await Promise.all([
    db.user.count(), db.facultyProfile.count(), db.block.count(),
    db.subject.count(), db.room.count(), db.schedule.count(), db.rosterEntry.count(),
  ]);
  console.log(
    `Seed complete: ${users} users, ${profiles} faculty, ${blocks} blocks, ${subjects} subjects, ${rooms} rooms, ${schedules} schedules, ${roster} roster entries.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
