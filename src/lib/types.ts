// src/lib/types.ts — Frozen shared contract (G2), copied verbatim from docs/INTERFACE-TYPES.md.
// Both agents code against these shapes exactly. Any change requires Leader approval.

export type Role = "ADMIN" | "FACULTY" | "STUDENT";
export type DayCode = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
export type Semester = "1st Sem" | "2nd Sem" | "Vacation";

export interface UserDTO { id: number; username: string; role: Role; }
export interface FacultyDTO { id: number; name: string; academicRank: string; advisory: string; lastHeartbeat: string | null; hasAccount: boolean; }
export interface DepartmentDTO { id: number; name: string; }
export interface BlockDTO { id: number; name: string; yearLevel: string; advisorId: number | null; advisorName: string | null; departmentId: number | null; departmentName: string | null; }
export interface SubjectDTO { id: number; description: string; }
export interface RoomDTO { id: number; name: string; }
export interface ScheduleDTO {
  id: number; semester: string; startTime: string; endTime: string; days: DayCode[];
  facultyId: number; facultyName: string;
  blockId: number; blockName: string;
  subjectId: number; subjectDescription: string;
  roomId: number; roomName: string;
}
export interface RosterEntryDTO { id: number; name: string; blockId: number; blockName: string; }
export interface RoomWeeklyTable { roomId: number; roomName: string; schedules: ScheduleDTO[]; }

export type StatusKind = "ACTIVE" | "INACTIVE" | "VACANT" | "UNAVAILABLE" | "NO_FACULTY";
export interface StatusBadge { kind: StatusKind; label: string; }