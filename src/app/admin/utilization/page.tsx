import { Notice } from "@/components/notice";
import { RoomTables } from "@/components/utilization/room-tables";
import { loadUtilization } from "@/components/data";

export const dynamic = "force-dynamic";

/* Admin "Home" tab — ported from admin.php's Home section, which iframed
 * HomeMainFunc/HomeTableMainFunc.php: the weekly room utilization tables with
 * the legacy status badges. The faculty/student dashboards render the same
 * canonical view (FR-020/FR-021); this exposes it to admins. */
export default async function AdminUtilizationPage() {
  const { data, degraded } = await loadUtilization();
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-text">Utilization</h1>
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
