import { EntityManager } from "@/components/admin/entity-manager";
import { loadFaculty } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-012 — faculty CRUD. Server page passes only serializable props; the
 * column/field/toForm configuration lives inside the client EntityManager
 * (functions cannot cross the server→client boundary — see entity-manager.tsx). */
export default async function AdminFacultyPage() {
  const { data, degraded } = await loadFaculty();
  return (
    <EntityManager
      entity="faculty"
      title="Faculty"
      description="Faculty records, academic ranks and advisory assignments."
      initialRows={data}
      initialDegraded={degraded}
    />
  );
}

