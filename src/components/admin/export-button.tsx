import { Download } from "lucide-react";

/* FR-015 — schedule CSV export. Plain GET anchor; the API streams text/csv.
 * Server-safe (no client JS needed). */
export function ExportSchedulesButton() {
  return (
    <a
      href="/api/export/schedules"
      download
      className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-surface px-4 text-sm font-medium text-text transition-colors duration-200 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Download aria-hidden="true" className="h-4 w-4" />
      Export CSV
    </a>
  );
}
