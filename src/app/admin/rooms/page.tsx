import { EntityManager } from "@/components/admin/entity-manager";
import { loadRooms } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-012 — rooms CRUD. Serializable props only (see entity-manager.tsx). */
export default async function AdminRoomsPage() {
  const { data, degraded } = await loadRooms();
  return (
    <EntityManager
      entity="rooms"
      title="Rooms"
      description="Rooms and venues tracked by the system."
      initialRows={data}
      initialDegraded={degraded}
    />
  );
}

