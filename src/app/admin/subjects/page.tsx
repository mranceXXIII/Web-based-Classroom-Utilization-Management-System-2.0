import { EntityManager } from "@/components/admin/entity-manager";
import { loadSubjects } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-012 — subjects CRUD. Serializable props only (see entity-manager.tsx). */
export default async function AdminSubjectsPage() {
  const { data, degraded } = await loadSubjects();
  return (
    <EntityManager
      entity="subjects"
      title="Subjects"
      description="Subject descriptions offered by the department."
      initialRows={data}
      initialDegraded={degraded}
    />
  );
}

