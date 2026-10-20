// src/lib/status.ts — exact port of legacy statusFunc() + weekly room table builder.
// Source of truth: legacy Faculty/HomeTableMainFunc.php lines 132–235 (identical in
// Students/HomeTableMainFunc.php), re-verified during this run. All wall-clock logic
// uses Asia/Manila (ARCHITECTURE §7).
//
// Legacy rules (PHP, verbatim semantics):
//   $timeDiffMinutes = round((now - heartbeat)/60);  $dateDiffDays = now.diff(heartbeat).days;
//   if ($dateDiffDays > 0 || $timeDiffMinutes > 900) {          // red
//     if ($dateDiffDays > 0)  "Vacant N day(s)"
//     else if (minutes <= 60) "Unavailable N min"
//     else                    "Unavailable floor(minutes/60) hr(s)"
//   } else if (start < now < end) "Active"                       // green (STRICT inequalities)
//   else "Inactive"                                              // blue
//   no faculty row → "No Faculty"
// Note: EXISTING-PROJECT-ANALYSIS.md §4.1 compresses this as "gap ≤ 15h → Unavailable", which
// inverts the legacy condition; the legacy code above is authoritative (see PROGRESS-LOG-BACKEND.md).
import type { RoomWeeklyTable, ScheduleDTO, StatusBadge } from "./types";
import { MANILA_TZ } from "./semester";

/** Manila wall-clock time-of-day as "HH:MM:SS" (h23, zero-padded). */
export function manilaTimeOfDay(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MANILA_TZ,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
  return parts; // "HH:MM:SS"
}

/** Normalize "HH:MM" or "HH:MM:SS" to "HH:MM:SS" for lexicographic comparison. */
function toHhmmss(t: string): string {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(t.trim());
  if (!m) throw new Error(`Invalid time string: "${t}"`);
  const pad = (s: string | undefined, fallback: string) => (s ?? fallback).padStart(2, "0");
  return `${m[1].padStart(2, "0")}:${pad(m[2], "00")}:${pad(m[3], "00")}`;
}

export interface StatusInput {
  /** false → NO_FACULTY (legacy: no matching it_faculty row). */
  hasFaculty: boolean;
  /** Faculty heartbeat instant (ISO) or null if never sent. */
  lastHeartbeat: string | Date | null | undefined;
  /** Schedule window, "HH:MM" (24h). */
  startTime: string;
  endTime: string;
}

/**
 * Ported statusFunc. `now` is injectable for tests; defaults to the real clock.
 */
export function statusFunc(input: StatusInput, now: Date = new Date()): StatusBadge {
  const { hasFaculty, lastHeartbeat, startTime, endTime } = input;
  if (!hasFaculty) return { kind: "NO_FACULTY", label: "No Faculty" };

  if (lastHeartbeat) {
    const hb = typeof lastHeartbeat === "string" ? new Date(lastHeartbeat) : lastHeartbeat;
    const diffMs = now.getTime() - hb.getTime();
    const minutes = Math.round(diffMs / 60000); // PHP round((cur - hb)/60)
    const days = Math.floor(diffMs / 86400000); // PHP DateTime::diff()->days (fixed offset zone)
    if (days > 0) return { kind: "VACANT", label: `Vacant ${days} day(s)` };
    if (minutes > 900) {
      if (minutes <= 60) return { kind: "UNAVAILABLE", label: `Unavailable ${minutes} min` };
      return { kind: "UNAVAILABLE", label: `Unavailable ${Math.floor(minutes / 60)} hr(s)` };
    }
    // legacy: fall through to time-window check when days === 0 && minutes <= 900
  }
  // Null heartbeat (new-schema possibility): fall back to time-vs-schedule logic
  // per ARCHITECTURE §6 ("Heartbeat not yet sent → badge falls back to time-vs-schedule logic").

  const current = manilaTimeOfDay(now);
  const start = toHhmmss(startTime);
  const end = toHhmmss(endTime);
  if (current > start && current < end) return { kind: "ACTIVE", label: "Active" };
  return { kind: "INACTIVE", label: "Inactive" };
}

/** Sentinel used on the wire for schedules without a faculty row (frozen DTO keeps ids numeric). */
export const NO_FACULTY_ID = 0;
export const NO_FACULTY_NAME = "None"; // legacy cell text for table_sched.faculty = 'None'

/** Convenience: compute the badge for a serialized schedule. */
export function scheduleStatusBadge(
  schedule: ScheduleDTO,
  heartbeatByFacultyId: Map<number, string | null>,
  now: Date = new Date()
): StatusBadge {
  const hasFaculty = schedule.facultyId !== NO_FACULTY_ID;
  return statusFunc(
    {
      hasFaculty,
      lastHeartbeat: hasFaculty ? heartbeatByFacultyId.get(schedule.facultyId) ?? null : null,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    },
    now
  );
}

/**
 * Legacy weekly tables: one table per room, schedules ordered by Start_Time ASC
 * (legacy createScheduleTable ORDER BY table_sched.Start_Time ASC). Rooms appear
 * in legacy rooms-table order (id ascending among schedules present).
 */
export function buildRoomTables(schedules: ScheduleDTO[]): RoomWeeklyTable[] {
  const byRoom = new Map<number, RoomWeeklyTable>();
  for (const s of schedules) {
    let table = byRoom.get(s.roomId);
    if (!table) {
      table = { roomId: s.roomId, roomName: s.roomName, schedules: [] };
      byRoom.set(s.roomId, table);
    }
    table.schedules.push(s);
  }
  const tables = [...byRoom.values()];
  for (const t of tables) {
    t.schedules.sort((a, b) =>
      a.startTime === b.startTime ? a.id - b.id : a.startTime < b.startTime ? -1 : 1
    );
  }
  tables.sort((a, b) => a.roomId - b.roomId);
  return tables;
}