import Link from "next/link";
import { ArrowRight, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { AppHeader } from "@/components/app-header";

/* FR-001 — minimalist role-selection landing. One design language: quiet
 * surface cards, single accent, generous whitespace, no decoration. */
export default function LandingPage() {
  const roles = [
    {
      role: "admin",
      title: "Admin",
      icon: ShieldCheck,
      description: "Manage faculty, blocks, subjects, rooms, schedules and the student roster.",
    },
    {
      role: "faculty",
      title: "Faculty",
      icon: GraduationCap,
      description: "View weekly room utilization and keep your presence heartbeat active.",
    },
    {
      role: "student",
      title: "Student",
      icon: Users,
      description: "Check room and venue schedules for the current semester, read-only.",
    },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Education Department</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Classroom Utilization Management
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Romblon State University — Cajidiocan Campus. Track how rooms and venues are used
            across blocks, subjects and faculty in one clean view.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {roles.map(({ role, title, icon: Icon, description }) => (
            <Link
              key={role}
              href={`/login/${role}`}
              className="group flex flex-col rounded-lg border border-border bg-surface p-5 transition-colors duration-200 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="mt-4 text-base font-semibold text-text">{title}</span>
              <span className="mt-1 flex-1 text-sm leading-relaxed text-muted">{description}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                Sign in
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </main>
      <footer className="border-t border-border py-5">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted sm:px-6">
          RSU Cajidiocan · Education Department — rebuilt 2.0
        </p>
      </footer>
    </div>
  );
}
