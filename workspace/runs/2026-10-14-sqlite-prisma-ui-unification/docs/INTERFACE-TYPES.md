# INTERFACE-TYPES — Frozen Shared Contract (G2)

_Both agents code against these shapes exactly. Backend implements them (`src/lib/types.ts`); frontend imports them. Any change requires Leader approval._

```ts
export type Role = "ADMIN" | "FACULTY" | "STUDENT";
export type DayCode = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
export type Semester = "1st Sem" | "2nd Sem" | "Vacation";

export interface UserDTO { id: number; username: string; role: Role; }
export interface FacultyDTO { id: number; name: string; academicRank: string; advisory: string; lastHeartbeat: string | null; hasAccount: boolean; }
export interface BlockDTO { id: number; name: string; yearLevel: string; advisorId: number | null; advisorName: string | null; }
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
```

## API Envelope

- Success: `{ "data": T }` (HTTP 200)
- Error: `{ "error": string, "fields"?: Record<string,string> }` (HTTP 400/401/403/404/409/500)

## Endpoints (see PLAN.md §Interface Contract for full list)

`/api/auth/login`, `/api/auth/logout`, `/api/auth/register/student|faculty|admin`,
`/api/crud/{faculty|blocks|subjects|rooms|schedules|roster}` (GET/POST/PUT/DELETE),
`/api/heartbeat` (GET), `/api/export/schedules` (GET → text/csv), `/api/import/roster` (POST multipart).

**days wire format:** API accepts/returns `DayCode[]`; Prisma stores comma-joined string.
**times:** `"HH:MM"` 24h strings.
