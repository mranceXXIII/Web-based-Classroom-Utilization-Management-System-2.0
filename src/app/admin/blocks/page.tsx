import { BlocksManager } from "@/components/admin/blocks-manager";
import { loadBlocks, loadFaculty } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-012 — blocks CRUD, grouped by year level as collapsible cards
 * (blocks-manager.tsx). The server page passes only serializable props:
 * the initial rows and the faculty option list for the advisor select. */
export default async function AdminBlocksPage() {
  const [{ data, degraded }, faculty] = await Promise.all([loadBlocks(), loadFaculty()]);
  return (
    <BlocksManager
      initialRows={data}
      initialDegraded={degraded}
      facultyOptions={faculty.data.map((f) => ({ value: String(f.id), label: f.name }))}
    />
  );
}


