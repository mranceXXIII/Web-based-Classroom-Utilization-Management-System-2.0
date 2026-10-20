import Link from "next/link";
import { BookOpen, CalendarDays, DoorOpen, GraduationCap, Table2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { loadBlocks, loadFaculty, loadRoster, loadRooms, loadSchedules, loadSubjects } from "@/components/data";

export const dynamic = "force-dynamic";

/* Admin overview (FR-012/013 entry): live counts + section shortcuts. */
export default async function AdminOverviewPage() {
  const [faculty, blocks, subjects, rooms, schedules, roster] = await Promise.all([
    loadFaculty(), loadBlocks(), loadSubjects(), loadRooms(), loadSchedules(), loadRoster(),
  ]);

  const stats = [
    { label: "Faculty", count: faculty.data.length, href: "/admin/faculty", icon: GraduationCap },
    { label: "Blocks", count: blocks.data.length, href: "/admin/blocks", icon: BookOpen },
    { label: "Subjects", count: subjects.data.length, href: "/admin/subjects", icon: Table2 },
    { label: "Rooms", count: rooms.data.length, href: "/admin/rooms", icon: DoorOpen },
    { label: "Schedules", count: schedules.data.length, href: "/admin/schedules", icon: CalendarDays },
    { label: "Roster entries", count: roster.data.length, href: "/admin/roster", icon: Users },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-text">Overview</h1>
        <p className="mt-0.5 text-sm text-muted">Current records across the department.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, count, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border border-border bg-surface p-4 transition-colors duration-200 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">{label}</span>
              <Icon aria-hidden="true" className="h-4 w-4 text-muted transition-colors duration-200 group-hover:text-accent" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-text">{count}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
