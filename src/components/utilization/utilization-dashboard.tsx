import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UtilizationTable } from "@/components/data";
import type { DayCode } from "@/lib/types";

/* Utilization dashboard (server component): ranks rooms and weekdays by
 * schedule count from the already-loaded utilization tables, with simple
 * token-based bar charts. The top entry in each card is the answer to
 * "which room / which day has the most schedules". */

const DAYS: { code: DayCode; label: string }[] = [
  { code: "MON", label: "Monday" },
  { code: "TUE", label: "Tuesday" },
  { code: "WED", label: "Wednesday" },
  { code: "THU", label: "Thursday" },
  { code: "FRI", label: "Friday" },
  { code: "SAT", label: "Saturday" },
  { code: "SUN", label: "Sunday" },
];

interface Ranked {
  label: string;
  count: number;
  top: boolean;
}

function BarList({ rows, unit }: { rows: Ranked[]; unit: string }) {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0);
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r) => (
        <li key={r.label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className={r.top ? "font-semibold text-text" : "text-muted"}>
              {r.label}
              {r.top && r.count > 0 && (
                <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  Most {unit}
                </span>
              )}
            </span>
            <span className={`tabular-nums ${r.top ? "font-semibold text-text" : "text-muted"}`}>{r.count}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full ${r.top ? "bg-accent" : "bg-accent/40"}`}
              style={{ width: `${max === 0 ? 0 : Math.max((r.count / max) * 100, r.count > 0 ? 6 : 0)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function UtilizationDashboard({ tables }: { tables: UtilizationTable[] }) {
  const total = tables.reduce((sum, t) => sum + t.rows.length, 0);

  const roomRows: Ranked[] = tables
    .map((t) => ({ label: `Room ${t.roomName}`, count: t.rows.length, top: false }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const dayRows: Ranked[] = DAYS.map(({ code, label }) => ({
    label,
    count: tables.reduce(
      (sum, t) => sum + t.rows.filter((row) => (row.days as DayCode[]).includes(code)).length,
      0
    ),
    top: false,
  })).sort((a, b) => b.count - a.count || DAYS.findIndex((d) => d.label === a.label) - DAYS.findIndex((d) => d.label === b.label));

  const topRoom = roomRows[0];
  const topDay = dayRows[0];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Schedules per room</CardTitle>
          <CardDescription>
            {topRoom && topRoom.count > 0
              ? `${topRoom.label} has the most schedules (${topRoom.count} of ${total}).`
              : "No schedules yet."}
          </CardDescription>
        </CardHeader>
        <div className="px-4 pb-4 sm:px-5">
          <BarList rows={roomRows} unit="schedules" />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedules per weekday</CardTitle>
          <CardDescription>
            {topDay && topDay.count > 0
              ? `${topDay.label} is the busiest day (${topDay.count} schedules across all rooms).`
              : "No schedules yet."}
          </CardDescription>
        </CardHeader>
        <div className="px-4 pb-4 sm:px-5">
          <BarList rows={dayRows} unit="schedules" />
        </div>
      </Card>
    </div>
  );
}
