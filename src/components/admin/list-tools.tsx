"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

/* Search + Refresh toolbar — ported from list.php: the search filters every
 * table row on the page by its text content (contains, like the PHP
 * `cell.textContent.includes(keyword)`), refresh restores all rows and
 * re-fetches live data. Uniform Button + field input styling. */
export function ListTools() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function search() {
    const keyword = inputRef.current?.value.trim() ?? "";
    const rows = document.querySelectorAll<HTMLElement>("tbody tr");
    rows.forEach((row) => {
      if (keyword === "") {
        row.style.display = "";
        return;
      }
      const cells = row.querySelectorAll("td");
      let visible = false;
      cells.forEach((cell) => {
        if (cell.textContent && cell.textContent.includes(keyword)) visible = true;
      });
      row.style.display = visible ? "" : "none";
    });
  }

  function refresh() {
    if (inputRef.current) inputRef.current.value = "";
    document.querySelectorAll<HTMLElement>("tbody tr").forEach((row) => {
      row.style.display = "";
    });
    router.refresh(); // re-fetch live data on top of the PHP's unfilter behavior
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <label htmlFor="list-search" className="sr-only">
        Search all lists
      </label>
      <input
        ref={inputRef}
        id="list-search"
        type="text"
        placeholder="Search"
        onKeyDown={(e) => {
          if (e.key === "Enter") search();
        }}
        className="h-8 w-48 rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-muted/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent"
      />
      <Button variant="primary" size="sm" onClick={search}>
        <Search aria-hidden="true" className="h-3.5 w-3.5" />
        Search
      </Button>
      <Button variant="secondary" size="sm" onClick={refresh}>
        <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
        Refresh
      </Button>
    </div>
  );
}

