// src/lib/serialize.ts — Prisma → DTO mappers (frozen shapes in types.ts).
// Server components (faculty/student utilization pages) and API routes both use these.
import type { Prisma } from "@prisma/client";
import type {
  BlockDTO, FacultyDTO, RosterEntryDTO, RoomDTO, ScheduleDTO, SubjectDTO, UserDTO, DayCode,
} from "./types";
import { NO_FACULTY_ID, NO_FACULTY_NAME } from "./status";

export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: { faculty: true; block: true; subject: true; room: true };
}>;
export type FacultyWithUser = Prisma.FacultyProfileGetPayload<{ include: { user: true } }>;
export type BlockWithAdvisor = Prisma.BlockGetPayload<{ include: { advisor: true } }>;
export type RosterWithBlock = Prisma.RosterEntryGetPayload<{ include: { block: true } }>;

export function toUserDTO(user: { id: number; username: string; role: string }): UserDTO {
  return { id: user.id, username: user.username, role: user.role as UserDTO["role"] };
}

export function toFacultyDTO(profile: FacultyWithUser): FacultyDTO {
  return {
    id: profile.id,
    name: profile.name,
    academicRank: profile.academicRank,
    advisory: profile.advisory,
    lastHeartbeat: profile.lastHeartbeat ? profile.lastHeartbeat.toISOString() : null,
    hasAccount: profile.userId !== null,
  };
}

export function toBlockDTO(block: BlockWithAdvisor & { department?: { id: number; name: string } | null }): BlockDTO {
  return {
    id: block.id,
    name: block.name,
    yearLevel: block.yearLevel,
    advisorId: block.advisorId,
    advisorName: block.advisor?.name ?? null,
    departmentId: block.department?.id ?? null,
    departmentName: block.department?.name ?? null,
  };
}

export function toSubjectDTO(subject: { id: number; description: string } & {
  yearLevel?: string;
  department?: { id: number; name: string } | null;
}): SubjectDTO {
  return {
    id: subject.id,
    description: subject.description,
    yearLevel: subject.yearLevel ?? "Not specified",
    departmentId: subject.department?.id ?? null,
    departmentName: subject.department?.name ?? null,
  };
}

export function toRoomDTO(room: { id: number; name: string }): RoomDTO {
  return { id: room.id, name: room.name };
}

export function toScheduleDTO(s: ScheduleWithRelations): ScheduleDTO {
  return {
    id: s.id,
    semester: s.semester,
    startTime: s.startTime,
    endTime: s.endTime,
    days: (s.days ? s.days.split(",").filter(Boolean) : []) as DayCode[],
    facultyId: s.facultyId ?? NO_FACULTY_ID,
    facultyName: s.faculty?.name ?? NO_FACULTY_NAME,
    blockId: s.blockId,
    blockName: s.block.name,
    subjectId: s.subjectId,
    subjectDescription: s.subject.description,
    roomId: s.roomId,
    roomName: s.room.name,
  };
}

export function toRosterEntryDTO(r: RosterWithBlock): RosterEntryDTO {
  return {
    id: r.id,
    name: r.name,
    blockId: r.blockId ?? NO_FACULTY_ID, // 0 = no block recorded (legacy block='')
    blockName: r.block?.name ?? "",
  };
}