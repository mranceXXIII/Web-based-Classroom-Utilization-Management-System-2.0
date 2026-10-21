import { CsvButton } from "@/components/admin/csv-button";
import { ListTools } from "@/components/admin/list-tools";
import { loadFaculty, loadRooms, loadSchedules, loadSubjects } from "@/components/data";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TableShell, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import type { DayCode } from "@/lib/types";

export const dynamic = "force-dynamic";

/* "List" module — ported from Scheduling_SystemSimple PHP/schedulingsystem/list.php
 * (roomlist/faclist/sublist/timelist), rendered in the app's design system:
 * Card surfaces + TableShell tables + uniform Buttons. Search/refresh filter
 * every table (list-tools.tsx); each table carries a "Convert Table to CSV"
 * button (csv-button.tsx, same DOM-to-CSV algorithm as the PHP).
 * Mutations live in the dedicated admin sections; this page is the read-only
 * quick reference, like list.php. Notes: legacy subject codes were dropped by
 * the frozen data model; logs.php has no ported model (see DATA-MODEL.md). */

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
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-text">List</h1>
          <p className="mt-0.5 text-sm text-muted">
            Reference lists with search and per-table CSV export.
          </p>
        </div>
        <ListTools />
      </div>

      {/* List of rooms — list.php → roomlist.php (id tableroomlist) */}
      <Card>
        <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>List of rooms</CardTitle>
          <CsvButton tableId="tableroomlist" filename="tableroomlist" />
        </CardHeader>
        <TableShell id="tableroomlist">
          <THead>
            <TR>
              <TH>Rooms</TH>
            </TR>
          </THead>
          <TBody>
            {rooms.data.map((room) => (
              <TR key={room.id}>
                <TD>{room.name}</TD>
              </TR>
            ))}
            {rooms.data.length === 0 && (
              <TR>
                <TD className="text-muted">No rooms recorded.</TD>
              </TR>
            )}
          </TBody>
        </TableShell>
      </Card>

      {/* List of Faculties — list.php → faclist.php (id tablefaclist) */}
      <Card>
        <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>List of Faculties ({facultySorted.length})</CardTitle>
          <CsvButton tableId="tablefaclist" filename="tablefaclist" />
        </CardHeader>
        <TableShell id="tablefaclist">
          <THead>
            <TR>
              <TH>Faculty</TH>
              <TH>Advisory</TH>
            </TR>
          </THead>
          <TBody>
            {facultySorted.map((f) => (
              <TR key={f.id}>
                <TD>{f.name}</TD>
                <TD>{f.advisory}</TD>
              </TR>
            ))}
            {facultySorted.length === 0 && (
              <TR>
                <TD className="text-muted" colSpan={2}>
                  No faculty recorded.
                </TD>
              </TR>
            )}
          </TBody>
        </TableShell>
      </Card>

      {/* List of Subjects — list.php → sublist.php (id tablesublist) */}
      <Card>
        <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>List of Subjects</CardTitle>
          <CsvButton tableId="tablesublist" filename="tablesublist" />
        </CardHeader>
        <TableShell id="tablesublist">
          <THead>
            <TR>
              <TH>Subject</TH>
            </TR>
          </THead>
          <TBody>
            {subjectsSorted.map((s) => (
              <TR key={s.id}>
                <TD>{s.description}</TD>
              </TR>
            ))}
            {subjectsSorted.length === 0 && (
              <TR>
                <TD className="text-muted">No subjects recorded.</TD>
              </TR>
            )}
          </TBody>
        </TableShell>
      </Card>

      {/* List of class time — list.php → timelist.php: per semester, per day.
       * The green day header uses the raw <th> (not TH) to avoid Tailwind class
       * conflicts when overriding color/case. */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold tracking-tight text-text">
          List of class time
        </h2>
        {SEMESTERS.map((sem) => (
          <div key={sem} className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-rsu-deep dark:text-accent">
              {sem}
            </h3>
            {DAY_ORDER.map((day) => {
              const daySchedules = schedules.data
                .filter((s) => s.semester === sem && s.days.includes(day))
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              const tableId = `${day}--${sem}`;
              return (
                <Card key={tableId}>
                  <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>
                      {DAY_LABEL[day]}{" "}
                      <span className="text-muted">({daySchedules.length})</span>
                    </CardTitle>
                    <CsvButton tableId={tableId} filename={tableId} />
                  </CardHeader>
                  <TableShell id={tableId}>
                    <THead>
                      <TR>
                        <th
                          colSpan={5}
                          className="bg-rsu-deep px-3 py-2.5 text-center text-sm font-semibold text-white sm:px-4"
                        >
                          {DAY_LABEL[day]} — {sem}
                        </th>
                      </TR>
                      <TR>
                        <TH>Room</TH>
                        <TH>Blocks</TH>
                        <TH>Faculty</TH>
                        <TH>Start time</TH>
                        <TH>End time</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {daySchedules.map((s) => (
                        <TR key={s.id}>
                          <TD>{s.roomName}</TD>
                          <TD>{s.blockName}</TD>
                          <TD>{s.facultyId === 0 ? "None" : s.facultyName}</TD>
                          <TD>{fmtTime(s.startTime)}</TD>
                          <TD>{fmtTime(s.endTime)}</TD>
                        </TR>
                      ))}
                      {daySchedules.length === 0 && (
                        <TR>
                          <TD className="text-muted" colSpan={5}>
                            No classes on {DAY_LABEL[day]}.
                          </TD>
                        </TR>
                      )}
                    </TBody>
                  </TableShell>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
