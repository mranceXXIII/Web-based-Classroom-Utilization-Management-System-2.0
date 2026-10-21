"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/notice";
import type { UtilizationTable } from "@/components/data";
import type { DayCode } from "@/lib/types";

/* FR-020/FR-021 — weekly utilization view, per room. Each room renders as a
 * collapsed summary card (skeleton); clicking it expands the room's whole
 * week: every day's schedules with time, subject, block, faculty and the
 * status badge computed from the ported legacy rules. Client component (the
 * expand/collapse state is interactive). */

const DAYS: { code: DayCode; label: string }[] = [
  { code: "MON", label: "Monday" },
  { code: "TUE", label: "Tuesday" },
  { code: "WED", label: "Wednesday" },
  { code: "THU", label: "Thursday" },
  { code: "FRI", label: "Friday" },
  { code: "SAT", label: "Saturday" },
  { code: "SUN", label: "Sunday" },
];

function RoomWeek({ table }: { table: UtilizationTable }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 sm:px-5">
      {DAYS.map(({ code, label }) => {
        const dayRows = table.rows
          .filter((row) => row.days.includes(code))
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        return (
          <div key={code} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-text">{label}</h4>
              <span className="text-xs text-muted">
                {dayRows.length === 0 ? "No classes" : `${dayRows.length} schedule${dayRows.length === 1 ? "" : "s"}`}
              </span>
            </div>
            {dayRows.length > 0 && (
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-surface-2/60">
                      <th scope="col" className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Time</th>
                      <th scope="col" className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Subject</th>
                      <th scope="col" className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Block</th>
                      <th scope="col" className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Faculty</th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dayRows.map((row) => (
                      <tr key={row.id} className="transition-colors duration-200 hover:bg-surface-2/50">
                        <td className="px-3 py-2 align-middle text-text tabular-nums">{row.startTime}–{row.endTime}</td>
                        <td className="px-3 py-2 align-middle font-medium text-text">{row.subjectDescription}</td>
                        <td className="px-3 py-2 align-middle text-muted">{row.blockName}</td>
                        <td className="px-3 py-2 align-middle text-muted">
                          {row.facultyId === 0 ? <span className="italic">None</span> : row.facultyName}
                        </td>
                        <td className="px-3 py-2 text-right align-middle">
                          <StatusBadge kind={row.badge.kind} label={row.badge.label} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function RoomTables({ tables, semester }: {
  tables: UtilizationTable[];
  semester: string;
}) {
  const [openRoomIds, setOpenRoomIds] = useState<number[]>([]);

  function toggle(roomId: number) {
    setOpenRoomIds((ids) =>
      ids.includes(roomId) ? ids.filter((id) => id !== roomId) : [...ids, roomId]
    );
  }

  if (tables.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface">
        <EmptyState
          title={`No schedules for ${semester}`}
          description="There are no class schedules for the current semester yet."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tables.map((table) => {
        const open = openRoomIds.includes(table.roomId);
        const activeCount = table.rows.filter((row) => row.badge.kind === "ACTIVE").length;
        return (
          <Card key={table.roomId}>
            <div className="border-b border-border">
              <button
                type="button"
                onClick={() => toggle(table.roomId)}
                aria-expanded={open}
                aria-controls={`room-week-${table.roomId}`}
                className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left transition-colors duration-200 hover:bg-surface-2/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  />
                  <span className="flex flex-col leading-tight">
                    <span className="text-base font-semibold tracking-tight text-text">
                      Room {table.roomName}
                    </span>
                    <span className="text-sm text-muted">
                      {table.rows.length === 0
                        ? "No schedules this week"
                        : `${table.rows.length} schedule${table.rows.length === 1 ? "" : "s"} · ${activeCount} in class now · click to view the whole week`}
                    </span>
                  </span>
                </span>
                <span className="text-xs font-medium text-muted">{semester}</span>
              </button>
            </div>
            {open && (
              <CardContent className="pt-0">
                <div id={`room-week-${table.roomId}`}>
                  {table.rows.length === 0 ? (
                    <EmptyState title="No schedules" description="This room has no classes this semester." />
                  ) : (
                    <RoomWeek table={table} />
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

