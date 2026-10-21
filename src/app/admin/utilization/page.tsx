import { Notice } from "@/components/notice";
import { RoomTables } from "@/components/utilization/room-tables";
import { UtilizationDashboard } from "@/components/utilization/utilization-dashboard";
import { loadUtilization } from "@/components/data";

export const dynamic = "force-dynamic";

/* Admin "Home" tab — ported from admin.php's Home section, which iframed
 * HomeMainFunc/HomeTableMainFunc.php: the weekly room utilization view with
 * the legacy status badges. Rooms render as collapsed summary cards that
 * expand into the whole week (room-tables.tsx), and the dashboard cards rank
 * rooms and weekdays by schedule count (utilization-dashboard.tsx). */
export default async function AdminUtilizationPage() {
  const { data, degraded } = await loadUtilization();
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-text">Utilization</h1>
        <p className="mt-0.5 text-sm text-muted">
          Click a room to see its whole week · current semester: <span className="font-medium text-text">{data.semester}</span>
        </p>
      </div>
      {degraded && (
        <Notice variant="muted" title="Sample data">
          The backend API is not reachable yet, so sample schedules are shown.
        </Notice>
      )}
      <UtilizationDashboard tables={data.tables} />
      <h2 className="text-base font-semibold tracking-tight text-text">Rooms</h2>
      <RoomTables tables={data.tables} semester={data.semester} />
    </section>
  );
}

