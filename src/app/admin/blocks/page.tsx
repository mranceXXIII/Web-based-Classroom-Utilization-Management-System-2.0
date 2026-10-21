import { BlocksManager } from "@/components/admin/blocks-manager";
import { loadBlocks, loadDepartments, loadFaculty } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-012 — blocks CRUD, grouped by Department → Year level → Blocks as
 * collapsible cards (blocks-manager.tsx). The server page passes only
 * serializable props: initial rows, the faculty option list for the advisor
 * select, and the departments for grouping + the department select. */
export default async function AdminBlocksPage() {
  const [{ data, degraded }, faculty, departments] = await Promise.all([
    loadBlocks(),
    loadFaculty(),
    loadDepartments(),
  ]);
  return (
    <BlocksManager
      initialRows={data}
      initialDegraded={degraded}
      initialDepartments={departments.data}
      facultyOptions={faculty.data.map((f) => ({ value: String(f.id), label: f.name }))}
    />
  );
}
