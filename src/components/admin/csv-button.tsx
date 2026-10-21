"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/* "Convert Table to CSV" — ported from list.php/tablelist.php: walks the DOM
 * table rows, quotes every cell's text content, and downloads `${tableId}_data.csv`.
 * Works on the server-rendered table markup by element id, exactly like the PHP
 * buttons did. Uses the uniform Button (secondary/sm) per the design system. */
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
    <Button variant="secondary" size="sm" onClick={convert}>
      <Download aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

