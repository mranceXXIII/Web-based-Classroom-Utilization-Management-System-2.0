"use client";

import { Download } from "lucide-react";

/* "Convert Table to CSV" — ported from list.php/tablelist.php: walks the DOM
 * table rows, quotes every cell's text content, and downloads `${tableId}_data.csv`.
 * Works on the server-rendered table markup by element id, exactly like the PHP
 * buttons did. */
export function CsvButton({
  tableId,
  label = "Convert Table to CSV",
  filename,
}: {
  tableId: string;
  label?: string;
  filename?: string;
}) {
  function convert() {
    const table = document.getElementById(tableId) as HTMLTableElement | null;
    if (!table) return;
    let csv = "";
    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      const rowData: string[] = [];
      for (let j = 0; j < row.cells.length; j++) {
        rowData.push(`"${row.cells[j].textContent ?? ""}"`);
      }
      csv += rowData.join(",") + "\n";
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename ?? tableId}_data.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <button
      type="button"
      onClick={convert}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Download aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
