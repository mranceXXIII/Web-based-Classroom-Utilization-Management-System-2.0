import { CsvButton } from "@/components/admin/csv-button";
import { ListTools } from "@/components/admin/list-tools";
import { loadFaculty, loadRooms, loadSchedules, loadSubjects } from "@/components/data";
import type { DayCode, ScheduleDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

/* "List" module — ported from Scheduling_SystemSimple PHP/schedulingsystem/list.php:
 * one page of reference lists (rooms, faculties, subjects) plus the class-time
 * lists from timelist.php (per semester, per weekday, green day headers with
 * result counts, ordered by start time). Search/refresh filter every table
 * (list-tools.tsx) and each table carries a "Convert Table to CSV" button
 * (csv-button.tsx) — same DOM-to-CSV algorithm as the PHP.
 * Mutating these records lives in the dedicated admin sections (rooms/faculty/
 * subjects/schedules); this page is the read-only quick reference, like list.php.
 * Note: the legacy subject table had a code column; subject codes were dropped
 * by the frozen data model (seed.ts §subject), so subjects list by description.
 * The legacy logs.php module is not ported — the frozen SQLite model has no log
 * table (see DATA-MODEL.md). */

const DAY_LABEL: Record<DayCode, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

const DAY_ORDER: DayCode[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const SEMESTERS = ["1st Sem", "2nd Sem"] as const;

/** "09:01" → "9:01 AM" — the PHP `date("h:i A", strtotime(...))` format. */
function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

const th = "border border-border px-3 py-1.5 text-left text-xs font-semibold text-text";
const td = "border border-border px-3 py-1.5 text-sm text-text";

export default async function AdminListPage() {
  const [rooms, faculty, subjects, schedules] = await Promise.all([
    loadRooms(),
    loadFaculty(),
    loadSubjects(),
    loadSchedules(),
  ]);

  const facultySorted = [...faculty.data].sort((a, b) => a.name.localeCompare(b.name));
  const subjectsSorted = [...subjects.data].sort((a, b) =>
    a.description.localeCompare(b.description)
  );

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-text">List</h1>
        <p className="mt-0.5 text-sm text-muted">
          Reference lists with search and per-table CSV export.
        </p>
      </div>

      <ListTools />

      {/* List of rooms — list.php → roomlist.php (id tableroomlist) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-text">List of rooms</h2>
          <CsvButton tableId="tableroomlist" filename="tableroomlist" />
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table id="tableroomlist" className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Rooms</th>
              </tr>
            </thead>
            <tbody>
              {rooms.data.map((room) => (
                <tr key={room.id}>
                  <td className={td}>{room.name}</td>
                </tr>
              ))}
              {rooms.data.length === 0 && (
                <tr>
                  <td className={td + " text-muted"}>No rooms recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* List of faculties — list.php → faclist.php (id tablefaclist) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-text">
            List of Faculties ({facultySorted.length})
          </h2>
          <CsvButton tableId="tablefaclist" filename="tablefaclist" />
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table id="tablefaclist" className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Faculty ({facultySorted.length})</th>
                <th className={th}>Advisory</th>
              </tr>
            </thead>
            <tbody>
              {facultySorted.map((f) => (
                <tr key={f.id}>
                  <td className={td}>{f.name}</td>
                  <td className={td}>{f.advisory}</td>
                </tr>
              ))}
              {facultySorted.length === 0 && (
                <tr>
                  <td className={td + " text-muted"} colSpan={2}>
                    No faculty recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* List of subjects — list.php → sublist.php (id tablesublist) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-text">List of Subjects</h2>
          <CsvButton tableId="tablesublist" filename="tablesublist" />
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table id="tablesublist" className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Subject</th>
              </tr>
            </thead>
            <tbody>
              {subjectsSorted.map((s) => (
                <tr key={s.id}>
                  <td className={td}>{s.description}</td>
                </tr>
              ))}
              {subjectsSorted.length === 0 && (
                <tr>
                  <td className={td + " text-muted"}>No subjects recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* List of class time — list.php → timelist.php: per semester, per day */}
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-text">List of class time</h2>
        {SEMESTERS.map((sem) => (
          <div key={sem} className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-rsu-deep dark:text-accent">
              {sem}
            </h3>
            {DAY_ORDER.map((day) => {
              const daySchedules = schedules.data
                .filter((s) => s.semester === sem && s.days.includes(day))
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              const tableId = `${day}--${sem}`;
              return (
                <div key={tableId} className="flex flex-col gap-2">
                  <CsvButton tableId={tableId} filename={tableId} />
                  <div className="overflow-x-auto rounded-lg border border-border bg-surface">
                    <table id={tableId} className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th
                            colSpan={5}
                            className="border border-border bg-rsu-deep px-3 py-1.5 text-center text-sm font-semibold text-white"
                          >
                            {DAY_LABEL[day]} ({daySchedules.length})
                          </th>
                        </tr>
                        <tr>
                          <th className={th + " bg-surface-2"}>Room</th>
                          <th className={th + " bg-surface-2"}>Blocks</th>
                          <th className={th + " bg-surface-2"}>Faculty</th>
                          <th className={th + " bg-surface-2"}>Start time</th>
                          <th className={th + " bg-surface-2"}>End time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daySchedules.map((s) => (
                          <tr key={s.id}>
                            <td className={td}>{s.roomName}</td>
                            <td className={td}>{s.blockName}</td>
                            <td className={td}>{s.facultyId === 0 ? "None" : s.facultyName}</td>
                            <td className={td}>{fmtTime(s.startTime)}</td>
                            <td className={td}>{fmtTime(s.endTime)}</td>
                          </tr>
                        ))}
                        {daySchedules.length === 0 && (
                          <tr>
                            <td className={td + " text-muted"} colSpan={5}>
                              No classes on {DAY_LABEL[day]}.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
