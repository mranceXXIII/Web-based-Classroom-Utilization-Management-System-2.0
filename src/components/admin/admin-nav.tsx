"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  DoorOpen,
  GraduationCap,
  LayoutGrid,
  List,
  Table2,
  Users,
  type LucideIcon,
} from "lucide-react";

/* Admin section nav (FR-012/013). Active state per ux-guidelines #3:
 * current section visually indicated. Same design language as the rest.
 * "Utilization" = the PHP admin Home tab (HomeTableMainFunc); "List" = the
 * PHP Scheduling_System list.php module. */
const sections: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/admin", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/admin/faculty", label: "Faculty", icon: GraduationCap },
  { href: "/admin/blocks", label: "Blocks", icon: BookOpen },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/admin/schedules", label: "Schedules", icon: CalendarDays },
  { href: "/admin/utilization", label: "Utilization", icon: Table2 },
  { href: "/admin/list", label: "List", icon: List },
  { href: "/admin/roster", label: "Roster", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {sections.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active
                ? "bg-accent/10 text-accent"
                : "text-muted hover:bg-surface-2 hover:text-text"
            }`}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
