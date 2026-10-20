import { EntityManager } from "@/components/admin/entity-manager";
import { loadRooms } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-012 — rooms CRUD. */
export default async function AdminRoomsPage() {
  const { data, degraded } = await loadRooms();
  return (
    <EntityManager
      entity="rooms"
      title="Rooms"
      description="Rooms and venues tracked by the system."
      initialRows={data}
      initialDegraded={degraded}
      columns={[
        { key: "name", header: "Room", render: (r) => <span className="font-medium">{r.name}</span> },
      ]}
      fields={[
        { key: "name", label: "Room name", type: "text", required: true, placeholder: "e.g., 201" },
      ]}
      toForm={(r) => ({ name: r.name })}
    />
  );
}
