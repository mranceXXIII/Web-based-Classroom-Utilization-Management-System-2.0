import { EntityManager } from "@/components/admin/entity-manager";
import { ExportSchedulesButton } from "@/components/admin/export-button";
import { DayDots } from "@/components/ui/badge";
import { SEMESTERS } from "@/components/mocks";
import type { DayCode } from "@/lib/types";
import { loadBlocks, loadFaculty, loadRooms, loadSchedules, loadSubjects } from "@/components/data";

export const dynamic = "force-dynamic";

/* FR-013 — schedules CRUD: block/subject/room/faculty selects, semester select,
 * HH:MM time pickers, day multi-select (MON..SUN). FR-015 export button. */
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
      headerExtra={<ExportSchedulesButton />}
      columns={[
        { key: "subjectDescription", header: "Subject", render: (r) => <span className="font-medium">{r.subjectDescription}</span> },
        { key: "blockName", header: "Block", render: (r) => <span className="text-muted">{r.blockName}</span> },
        { key: "facultyName", header: "Faculty", render: (r) => <span className="text-muted">{r.facultyName}</span> },
        { key: "roomName", header: "Room", render: (r) => <span className="tabular-nums">{r.roomName}</span> },
        { key: "time", header: "Time", render: (r) => <span className="tabular-nums text-muted">{r.startTime}–{r.endTime}</span> },
        { key: "days", header: "Days", render: (r) => <DayDots days={r.days as DayCode[]} /> },
        { key: "semester", header: "Semester", render: (r) => <span className="text-muted">{r.semester}</span> },
      ]}
      fields={[
        { key: "blockId", label: "Block", type: "select", required: true, options: blocks.data.map((b) => ({ value: String(b.id), label: b.name })) },
        { key: "subjectId", label: "Subject", type: "select", required: true, options: subjects.data.map((s) => ({ value: String(s.id), label: s.description })) },
        { key: "roomId", label: "Room", type: "select", required: true, options: rooms.data.map((r) => ({ value: String(r.id), label: r.name })) },
        { key: "facultyId", label: "Faculty", type: "select", options: [
          { value: "0", label: "None (no faculty)" },
          ...faculty.data.map((f) => ({ value: String(f.id), label: f.name })),
        ] },
        { key: "semester", label: "Semester", type: "select", required: true, options: SEMESTERS.map((s) => ({ value: s, label: s })) },
        { key: "startTime", label: "Start time", type: "time", required: true },
        { key: "endTime", label: "End time", type: "time", required: true },
        { key: "days", label: "Days", type: "days", required: true },
      ]}
      numericKeys={["blockId", "subjectId", "roomId", "facultyId"]}
      createDefaults={{ semester: "1st Sem" }}
      toForm={(r) => ({
        blockId: String(r.blockId),
        subjectId: String(r.subjectId),
        roomId: String(r.roomId),
        facultyId: String(r.facultyId), // 0 = "None" sentinel (API-CONTRACT.md)
        semester: r.semester,
        startTime: r.startTime.slice(0, 5),
        endTime: r.endTime.slice(0, 5),
        days: r.days.join(","),
      })}
    />
  );
}
