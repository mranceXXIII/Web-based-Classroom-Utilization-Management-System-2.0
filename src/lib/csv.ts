// src/lib/csv.ts — minimal RFC4180-style CSV reader/writer (no external deps).
// Used by /api/import/roster (parse) and /api/export/schedules (write).

/** Parse CSV text into rows of fields. Handles quoted fields ("" escapes), commas and newlines inside quotes, \r\n and \n. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      pushField();
      i++;
      continue;
    }
    if (ch === "\r") {
      if (text[i + 1] === "\n") i++;
      pushRow();
      i++;
      continue;
    }
    if (ch === "\n") {
      pushRow();
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field !== "" || row.length > 0) pushRow();
  // Drop a single trailing fully-empty row (common with trailing newline).
  if (rows.length > 0 && rows[rows.length - 1].every((c) => c === "")) rows.pop();
  return rows;
}

/** Escape a single CSV field (always quoted; doubles inner quotes). */
export function csvEscape(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/** Serialize rows to CSV text (CRLF line endings, all fields quoted — matches legacy export style).
 *  Formula-injection defense (FIND-003, CWE-1236, per SECURITY-ASSESSMENT.md §3): cells whose first
 *  character is `= + - @` or tab/CR are prefixed with a single quote so spreadsheet applications
 *  treat them as text instead of formulas. RFC4180 quoting is unchanged. */
const FORMULA_PREFIX_CHARS = new Set(["=", "+", "-", "@", "\t", "\r"]);

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map((r) => r.map((v) => csvEscape(neutralizeFormula(v))).join(","))
    .join("\r\n") + "\r\n";
}

function neutralizeFormula(value: string | number | null | undefined): string | number | null | undefined {
  if (typeof value !== "string" || value.length === 0) return value;
  if (FORMULA_PREFIX_CHARS.has(value[0])) return `'${value}`;
  return value;
}