import { DAY_LABELS } from "@/components/mocks";
import type { DayCode } from "@/lib/types";

/* Uniform badge (FR-030) + mandated status color map:
 * ACTIVE→success, INACTIVE→info, VACANT→danger, UNAVAILABLE→danger, NO_FACULTY→muted. */
export type BadgeVariant = "success" | "info" | "danger" | "muted" | "accent";

const badgeVariants: Record<BadgeVariant, string> = {
  success: "border-success/30 bg-success/10 text-success",
  info: "border-info/30 bg-info/10 text-info",
  danger: "border-danger/30 bg-danger/10 text-danger",
  muted: "border-border bg-surface-2 text-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
};

export function Badge({ variant = "muted", children, className = "" }: {
  variant?: BadgeVariant; children: React.ReactNode; className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  );
}

const statusVariant: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  INACTIVE: "info",
  VACANT: "danger",
  UNAVAILABLE: "danger",
  NO_FACULTY: "muted",
};

export function StatusBadge({ kind, label }: { kind: string; label: string }) {
  return <Badge variant={statusVariant[kind] ?? "muted"}>{label}</Badge>;
}

/** Day presence marks for the weekly tables (MON..SUN columns). */
export function DayDots({ days }: { days: DayCode[] }) {
  return (
    <span className="flex flex-wrap items-center gap-1" aria-label={`Days: ${days.map((d) => DAY_LABELS[d]).join(", ") || "none"}`}>
      {days.length === 0 ? (
        <span className="text-xs text-muted">—</span>
      ) : (
        days.map((d) => (
          <span key={d} className="inline-flex items-center rounded bg-accent/10 px-1.5 py-0.5 text-[11px] font-medium text-accent">
            {DAY_LABELS[d].charAt(0)}
          </span>
        ))
      )}
    </span>
  );
}
