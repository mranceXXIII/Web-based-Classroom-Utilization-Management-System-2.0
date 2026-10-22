// src/lib/schemas.ts — zod schemas for every API input (NFR-004).
import { z } from "zod";
import type { DayCode } from "./types";

export const roleSchema = z.enum(["ADMIN", "FACULTY", "STUDENT"]);

/** "HH:MM" 24h (wire format per INTERFACE-TYPES.md). */
export const hhmmSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be HH:MM (24h)");

const dayCodeSchema: z.ZodType<DayCode> = z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);

export const daysSchema = z.array(dayCodeSchema).min(1, "Select at least one day");

export const semesterSchema = z.enum(["1st Sem", "2nd Sem", "Vacation"]);

export const idSchema = z
  .coerce
  .number()
  .int()
  .positive()
  .lte(2147483647, "id out of range") // Prisma Int is 32-bit signed on SQLite; rejects ≥2^31 (and non-safe coercions) with 400 instead of a 500 (FIND-008)

// --- auth ---
export const loginSchema = z.object({
  role: roleSchema,
  username: z.string().trim().min(1, "Username is required").max(255),
  password: z.string().min(1, "Password is required").max(200),
});

export const studentRegisterSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  block: z.string().trim().min(1, "Block is required").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

export const namePasswordSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

// --- CRUD ---
export const facultySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  academicRank: z.string().trim().max(255).default("Not specified"),
  advisory: z.string().trim().max(255).default("None"),
});

export const blockSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  yearLevel: z.string().trim().min(1, "Year level is required").max(255),
  advisorId: z.coerce.number().int().positive().nullable().optional(),
  departmentId: z.coerce.number().int().positive().nullable().optional(),
});

export const departmentSchema = z.object({
  name: z.string().trim().min(1, "Department name is required").max(255),
});

export const subjectSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(250),
  yearLevel: z.string().trim().min(1, "Year level is required").max(255),
  departmentId: z.coerce.number().int().positive().nullable().optional(),
});

export const roomSchema = z.object({
  name: z.string().trim().min(1, "Room name is required").max(255),
});

export const scheduleSchema = z.object({
  semester: semesterSchema,
  startTime: hhmmSchema,
  endTime: hhmmSchema,
  days: daysSchema,
  /** 0 / null / absent = no faculty (legacy 'None'). */
  facultyId: z
    .union([z.literal(0), z.coerce.number().int().positive()])
    .nullable()
    .optional(),
  blockId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  roomId: z.coerce.number().int().positive(),
});

export const rosterSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  /** 0 / null / absent = no block recorded (legacy block=''). */
  blockId: z
    .union([z.literal(0), z.coerce.number().int().positive()])
    .nullable()
    .optional(),
});

export const idBodySchema = z.object({ id: idSchema });