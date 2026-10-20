// src/lib/semester.ts — legacy getQuarter() port (exact semantics).
// Legacy mapping (docs/EXISTING-PROJECT-ANALYSIS.md §4.2): months 8–12 → "1st Sem",
// 1–5 → "2nd Sem", else (6–7) → "Vacation". Timezone pinned to Asia/Manila (ARCHITECTURE §7).
import type { Semester } from "./types";

export const MANILA_TZ = "Asia/Manila";

/** Month (1–12) of `now` on the Asia/Manila wall clock. */
export function manilaMonth(now: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: MANILA_TZ, month: "numeric" }).format(now)
  );
}

/** Legacy semester mapping. */
export function getQuarter(now: Date = new Date()): Semester {
  const month = manilaMonth(now);
  if (month >= 8 && month <= 12) return "1st Sem";
  if (month >= 1 && month <= 5) return "2nd Sem";
  return "Vacation";
}