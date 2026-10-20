import { RoomTables } from "@/components/utilization/room-tables";
import { Notice } from "@/components/notice";
import { loadUtilization } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-020/FR-021 — faculty utilization dashboard (time-sensitive → dynamic). */
export default async function FacultyDashboardPage() {
  const { data, degraded } = await loadUtilization();
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-text">Weekly room utilization</h1>
        <p className="mt-0.5 text-sm text-muted">
          One table per room · current semester: <span className="font-medium text-text">{data.semester}</span>
        </p>
      </div>
      {degraded && (
        <Notice variant="muted" title="Sample data">
          The backend API is not reachable yet, so sample schedules are shown.
        </Notice>
      )}
      <RoomTables tables={data.tables} semester={data.semester} />
    </section>
  );
}
