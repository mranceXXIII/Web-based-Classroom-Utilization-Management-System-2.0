import { EntityManager } from "@/components/admin/entity-manager";
import { loadBlocks, loadFaculty, loadRooms, loadSchedules, loadSubjects } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-013 — schedules CRUD: block/subject/room/faculty selects, semester select,
 * HH:MM time pickers, day multi-select (MON..SUN). The select option lists are
 * passed as serializable {value,label} arrays; the column/field/toForm config
 * lives inside the client EntityManager (functions cannot cross the RSC
 * boundary — see entity-manager.tsx). FR-015 export button renders inside
 * EntityManager for the schedules entity. */
export default async function AdminSchedulesPage() {
  const [schedules, blocks, subjects, rooms, faculty] = await Promise.all([
    loadSchedules(), loadBlocks(), loadSubjects(), loadRooms(), loadFaculty(),
  ]);

  return (
    <EntityManager
      entity="schedules"
      title="Schedules"
      description="Class schedules per room, block and faculty for the selected semester."
      initialRows={schedules.data}
      initialDegraded={schedules.degraded}
      selectOptions={{
        blocks: blocks.data.map((b) => ({ value: String(b.id), label: b.name })),
        subjects: subjects.data.map((s) => ({ value: String(s.id), label: s.description })),
        rooms: rooms.data.map((r) => ({ value: String(r.id), label: r.name })),
        faculty: faculty.data.map((f) => ({ value: String(f.id), label: f.name })),
      }}
    />
  );
}

