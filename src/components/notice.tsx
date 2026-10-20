import { AlertCircle, CheckCircle2, Info } from "lucide-react";

/* Inline notices with recovery affordances (ux-guidelines: errors must offer a
 * next step; successes must be confirmed). Variants map to status tokens. */
export function Notice({ variant = "info", title, children, className = "" }: {
  variant?: "error" | "info" | "success" | "muted";
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const styles = {
    error: "border-danger/30 bg-danger/10 text-danger",
    info: "border-info/30 bg-info/10 text-info",
    success: "border-success/30 bg-success/10 text-success",
    muted: "border-border bg-surface-2 text-muted",
  } as const;
  const icons = {
    error: AlertCircle,
    info: Info,
    success: CheckCircle2,
    muted: Info,
  } as const;
  const Icon = icons[variant];
  return (
    <div role={variant === "error" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-md border px-3.5 py-2.5 text-sm ${styles[variant]} ${className}`}>
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
      </div>
    </div>
  );
}

/* Dead-end prevention (ux-guidelines #90): empty lists explain and offer action. */
export function EmptyState({ title, description, action, icon: Icon }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      {Icon && <Icon aria-hidden="true" className="h-8 w-8 text-muted" />}
      <p className="text-sm font-medium text-text">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Skeleton row block for loading states (no frozen UI, no layout shift). */
export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2.5 px-1 py-1" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-9 animate-pulse rounded-md bg-surface-2" />
      ))}
    </div>
  );
}
