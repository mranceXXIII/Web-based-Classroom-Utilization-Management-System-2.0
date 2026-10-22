import { SubjectsManager } from "@/components/admin/subjects-manager";
import { loadDepartments, loadSubjects } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-012 — subjects CRUD, grouped by Department → Year level → Subjects as
 * collapsible cards (subjects-manager.tsx). The server page passes only
 * serializable props: initial rows and the departments for grouping + the
 * department select in the add/edit form. */
export default async function AdminSubjectsPage() {
  const [{ data, degraded }, departments] = await Promise.all([
    loadSubjects(),
    loadDepartments(),
  ]);
  return (
    <SubjectsManager
      initialRows={data}
      initialDegraded={degraded}
      initialDepartments={departments.data}
    />
  );
}
