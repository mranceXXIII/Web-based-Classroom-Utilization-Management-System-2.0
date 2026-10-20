import { RosterSection } from "@/components/admin/roster-section";
import { loadRoster } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-014 — roster with CSV import. */
export default async function AdminRosterPage() {
  const { data, degraded } = await loadRoster();
  return <RosterSection initialRows={data} initialDegraded={degraded} />;
}
