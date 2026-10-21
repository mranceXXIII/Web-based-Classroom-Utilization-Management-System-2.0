import { EntityManager } from "@/components/admin/entity-manager";
import { loadBlocks, loadFaculty } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-012 — blocks CRUD; advisor select fed from faculty list (serializable
 * option arrays — see entity-manager.tsx). */
export default async function AdminBlocksPage() {
  const [{ data, degraded }, faculty] = await Promise.all([loadBlocks(), loadFaculty()]);
  return (
    <EntityManager
      entity="blocks"
      title="Blocks"
      description="Class blocks with year level and faculty advisor."
      initialRows={data}
      initialDegraded={degraded}
      selectOptions={{ faculty: faculty.data.map((f) => ({ value: String(f.id), label: f.name })) }}
    />
  );
}

