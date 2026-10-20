import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/notice";
import { TableShell, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import type { UtilizationTable } from "@/components/data";

/* FR-020/FR-021 — weekly utilization view: one uniform table per room, rows =
 * schedules (subject/block/faculty/time), columns MON..SUN presence, status
 * badge per schedule computed from the ported legacy rules. Server component. */
export function RoomTables({ tables, semester, showBadgeColumn = true }: {
  tables: UtilizationTable[];
  semester: string;
  showBadgeColumn?: boolean;
}) {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

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
    <div className="flex flex-col gap-5">
      {tables.map((table) => (
        <Card key={table.roomId}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Room {table.roomName}</CardTitle>
              <CardDescription>{semester}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0 py-0 sm:px-0">
            {table.rows.length === 0 ? (
              <EmptyState title="No schedules" description="This room has no classes this semester." />
            ) : (
              <TableShell className="rounded-b-lg">
                <THead>
                  <TR>
                    <TH>Subject</TH>
                    <TH>Block</TH>
                    <TH>Faculty</TH>
                    <TH>Time</TH>
                    {days.map((d) => <TH key={d} className="text-center">{d}</TH>)}
                    {showBadgeColumn && <TH className="text-right">Status</TH>}
                  </TR>
                </THead>
                <TBody>
                  {table.rows.map((row) => (
                    <TR key={row.id}>
                      <TD className="font-medium">{row.subjectDescription}</TD>
                      <TD className="text-muted">{row.blockName}</TD>
                      <TD className="text-muted">{row.facultyName}</TD>
                      <TD className="tabular-nums text-muted">{row.startTime}–{row.endTime}</TD>
                      {days.map((d) => (
                        <TD key={d} className="text-center">
                          {row.days.includes(d)
                            ? <span aria-label={d} className="inline-block h-2 w-2 rounded-full bg-accent" />
                            : <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-border" />}
                        </TD>
                      ))}
                      {showBadgeColumn && (
                        <TD className="text-right">
                          <StatusBadge kind={row.badge.kind} label={row.badge.label} />
                        </TD>
                      )}
                    </TR>
                  ))}
                </TBody>
              </TableShell>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
