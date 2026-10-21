/**
 * THIN DATA-ACCESS LAYER — the single seam between UI and data.
 *
 * Server loaders try the live API first (docs/API-CONTRACT.md envelope:
 * `{ data }` / `{ error, fields? }`) and fall back to the marked sample data
 * in mocks.ts only when the API is unreachable. `degraded: true` lets pages
 * show a truthful "sample data" notice instead of pretending mocks are live (R3).
 *
 * Types come from the backend-authored frozen contract src/lib/types.ts; the
 * utilization view is built with the CANONICAL legacy ports src/lib/status.ts
 * (buildRoomTables, scheduleStatusBadge — handles the facultyId 0 "None"
 * sentinel) and src/lib/semester.ts (getQuarter). No duplicated domain logic.
 */
import { headers } from "next/headers";
import { buildRoomTables, scheduleStatusBadge } from "@/lib/status";
import { getQuarter } from "@/lib/semester";
import type {
  BlockDTO, DepartmentDTO, FacultyDTO, RoomDTO, RoomWeeklyTable, RosterEntryDTO, ScheduleDTO,
  StatusBadge, SubjectDTO,
} from "@/lib/types";
import {
  mockBlocks, mockDepartments, mockFaculty, mockRoster, mockRooms, mockSchedules, mockSubjects,
} from "@/components/mocks";

export interface Degradable<T> { data: T; degraded: boolean; }

/** View model: canonical RoomWeeklyTable + precomputed per-schedule badges. */
export interface ScheduleRowVM extends ScheduleDTO { badge: StatusBadge; }
export interface UtilizationTable extends RoomWeeklyTable { rows: ScheduleRowVM[]; }

/** Server-side fetch of an internal API path with short timeout + graceful failure.
 *  POST-SHIP FIX 2 (2026-10-20): forwards the incoming request's `cookie` header so the
 *  call is authenticated as the logged-in user. Without it, every CRUD GET returned 401
 *  (they are role-guarded) and dashboards silently rendered mock sample data. Read
 *  authorization per endpoint: schedules GET accepts any authenticated role; faculty and
 *  blocks GET are public reads (registration + dashboards); the rest stay admin-only. */
async function tryApi<T>(path: string): Promise<T | null> {
  try {
    const h = await headers();
    const host = h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? "http";
    const cookie = h.get("cookie") ?? undefined;
    const res = await fetch(`${proto}://${host}${path}`, {
      cache: "no-store",
      headers: cookie ? { cookie } : undefined,
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: T };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export async function loadFaculty(): Promise<Degradable<FacultyDTO[]>> {
  const data = await tryApi<FacultyDTO[]>("/api/crud/faculty");
  return { data: data ?? mockFaculty, degraded: data === null };
}

export async function loadBlocks(): Promise<Degradable<BlockDTO[]>> {
  const data = await tryApi<BlockDTO[]>("/api/crud/blocks");
  return { data: data ?? mockBlocks, degraded: data === null };
}

export async function loadDepartments(): Promise<Degradable<DepartmentDTO[]>> {
  const data = await tryApi<DepartmentDTO[]>("/api/crud/departments");
  return { data: data ?? mockDepartments, degraded: data === null };
}

export async function loadSubjects(): Promise<Degradable<SubjectDTO[]>> {
  const data = await tryApi<SubjectDTO[]>("/api/crud/subjects");
  return { data: data ?? mockSubjects, degraded: data === null };
}

export async function loadRooms(): Promise<Degradable<RoomDTO[]>> {
  const data = await tryApi<RoomDTO[]>("/api/crud/rooms");
  return { data: data ?? mockRooms, degraded: data === null };
}

export async function loadSchedules(): Promise<Degradable<ScheduleDTO[]>> {
  const data = await tryApi<ScheduleDTO[]>("/api/crud/schedules");
  return { data: data ?? mockSchedules, degraded: data === null };
}

export async function loadRoster(): Promise<Degradable<RosterEntryDTO[]>> {
  const data = await tryApi<RosterEntryDTO[]>("/api/crud/roster");
  return { data: data ?? mockRoster, degraded: data === null };
}

/**
 * FR-020/FR-021: current-semester weekly room tables with status badges,
 * computed via the canonical ports (scheduleStatusBadge handles facultyId 0
 * → NO_FACULTY). Time-sensitive → call sites are force-dynamic.
 */
export async function loadUtilization(): Promise<
  Degradable<{ semester: string; tables: UtilizationTable[] }>
> {
  const [sched, fac] = await Promise.all([loadSchedules(), loadFaculty()]);
  const now = new Date();
  const heartbeatByFacultyId = new Map(fac.data.map((f) => [f.id, f.lastHeartbeat]));
  const tables: UtilizationTable[] = buildRoomTables(sched.data).map((t: RoomWeeklyTable) => ({
    ...t,
    rows: t.schedules.map((s) => ({
      ...s,
      badge: scheduleStatusBadge(s, heartbeatByFacultyId, now),
    })),
  }));
  return {
    data: { semester: getQuarter(now), tables },
    degraded: sched.degraded || fac.degraded,
  };
}


