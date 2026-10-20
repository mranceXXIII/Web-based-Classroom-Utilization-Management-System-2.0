import { EntityManager } from "@/components/admin/entity-manager";
import { Badge } from "@/components/ui/badge";
import { loadFaculty } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-012 — faculty CRUD. */
export default async function AdminFacultyPage() {
  const { data, degraded } = await loadFaculty();
  return (
    <EntityManager
      entity="faculty"
      title="Faculty"
      description="Faculty records, academic ranks and advisory assignments."
      initialRows={data}
      initialDegraded={degraded}
      columns={[
        { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
        { key: "academicRank", header: "Academic Rank" },
        { key: "advisory", header: "Advisory" },
        { key: "hasAccount", header: "Account", render: (r) => <Badge variant={r.hasAccount ? "success" : "muted"}>{r.hasAccount ? "Registered" : "No account"}</Badge> },
        { key: "lastHeartbeat", header: "Last heartbeat", render: (r) => r.lastHeartbeat ? new Date(r.lastHeartbeat).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : "—" },
      ]}
      fields={[
        { key: "name", label: "Name", type: "text", required: true },
        { key: "academicRank", label: "Academic rank", type: "text", required: true },
        { key: "advisory", label: "Advisory", type: "text", placeholder: "Block name or —" },
      ]}
      toForm={(r) => ({ name: r.name, academicRank: r.academicRank, advisory: r.advisory })}
    />
  );
}
