import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

/* RSU banner — ported from rsuHeader.php: green bar (#3D9B8A), circular
 * rsuLogo in a white badge, university name in white, gold (#EDC94F)
 * "The Green University" tag (hidden on small screens, like the PHP media
 * query). Right slot keeps page-level actions (logout) + theme toggle so the
 * dark/light switch survives the rebrand. Server component — the toggle is a
 * client leaf. */
export function AppHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 bg-rsu shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 rounded-md text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rsu-gold"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-0.5">
            <Image
              src="/rsuLogo.png"
              alt="Romblon State University seal"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-contain"
              priority
            />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold tracking-tight sm:text-base">
              Romblon State University Cajidiocan Campus
            </span>
            <span className="truncate text-[11px] text-white/80">
              Classroom Utilization Management System
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-xs font-semibold tracking-widest text-rsu-gold lg:inline">
            The Green University
          </span>
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
