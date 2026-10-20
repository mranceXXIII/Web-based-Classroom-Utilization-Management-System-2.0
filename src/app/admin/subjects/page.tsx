import { EntityManager } from "@/components/admin/entity-manager";
import { loadSubjects } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-012 — subjects CRUD. */
export default async function AdminSubjectsPage() {
  const { data, degraded } = await loadSubjects();
  return (
    <EntityManager
      entity="subjects"
      title="Subjects"
      description="Subject descriptions offered by the department."
      initialRows={data}
      initialDegraded={degraded}
      columns={[
        { key: "description", header: "Description", render: (r) => <span className="font-medium">{r.description}</span> },
      ]}
      fields={[
        { key: "description", label: "Subject description", type: "text", required: true, placeholder: "e.g., Assessment in Learning 1" },
      ]}
      toForm={(r) => ({ description: r.description })}
    />
  );
}
