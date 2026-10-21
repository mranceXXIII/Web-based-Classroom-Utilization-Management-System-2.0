"use client";

import { LayoutGrid, List } from "lucide-react";

/* List ⇄ Grid view toggle — the shared segmented control used by the skeleton
 * modules (Blocks, Utilization). Accessible: two icon buttons with
 * aria-pressed reflecting the active mode. */
export type ViewMode = "list" | "grid";

export function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  const base =
    "inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <div role="group" aria-label="View mode" className="inline-flex items-center rounded-md border border-border bg-surface p-0.5">
      <button
        type="button"
        aria-label="List view"
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className={`${base} ${view === "list" ? "bg-accent/10 text-accent" : "text-muted hover:text-text"}`}
      >
        <List aria-hidden="true" className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className={`${base} ${view === "grid" ? "bg-accent/10 text-accent" : "text-muted hover:text-text"}`}
      >
        <LayoutGrid aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
