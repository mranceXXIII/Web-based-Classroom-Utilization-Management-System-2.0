import { EntityManager } from "@/components/admin/entity-manager";
import { loadBlocks, loadFaculty } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-012 — blocks CRUD; advisor select fed from faculty list. */
export default async function AdminBlocksPage() {
  const [{ data, degraded }, faculty] = await Promise.all([loadBlocks(), loadFaculty()]);
  return (
    <EntityManager
      entity="blocks"
      title="Blocks"
      description="Class blocks with year level and faculty advisor."
      initialRows={data}
      initialDegraded={degraded}
      columns={[
        { key: "name", header: "Block", render: (r) => <span className="font-medium">{r.name}</span> },
        { key: "yearLevel", header: "Year level" },
        { key: "advisorName", header: "Advisor", render: (r) => r.advisorName ?? "—" },
      ]}
      fields={[
        { key: "name", label: "Block name", type: "text", required: true, placeholder: "e.g., BEEd 3-A" },
        { key: "yearLevel", label: "Year level", type: "text", required: true, placeholder: "1–6" },
        { key: "advisorId", label: "Advisor", type: "select", required: true, options: faculty.data.map((f) => ({ value: String(f.id), label: f.name })) },
      ]}
      numericKeys={["advisorId"]}
      toForm={(r) => ({ name: r.name, yearLevel: r.yearLevel, advisorId: r.advisorId === null ? "" : String(r.advisorId) })}
    />
  );
}
