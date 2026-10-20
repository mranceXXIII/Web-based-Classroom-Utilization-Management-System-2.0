import Link from "next/link";
import { CalendarRange } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

/* Shared brand header (FR-032): present on every page; right slot receives
 * page-level actions (heartbeat, logout). Server component — the toggle is a
 * client leaf. */
export function AppHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md text-text transition-colors duration-200 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CalendarRange aria-hidden="true" className="h-5 w-5 text-accent" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Classroom Utilization</span>
            <span className="text-[11px] text-muted">RSU Cajidiocan · Education Dept.</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
