// GET /api/export/schedules — FR-015 (admin-only). Streams the schedule list as text/csv.
// Columns: id,faculty,block,subject,room,days,start,end,semester (see docs/API-CONTRACT.md).
// Legacy export was client-side table scraping (Admin/.../tablelist.php) — this is the
// server-side equivalent with an explicit, stable column set.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard, internalError } from "@/lib/api";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  try {
    const schedules = await db.schedule.findMany({
      include: { faculty: true, block: true, subject: true, room: true },
      orderBy: { id: "asc" },
    });
    const rows: (string | number)[][] = [
      ["id", "faculty", "block", "subject", "room", "days", "start", "end", "semester"],
      ...schedules.map((s) => [
        s.id,
        s.faculty?.name ?? "None",
        s.block.name,
        s.subject.description,
        s.room.name,
        s.days,
        s.startTime,
        s.endTime,
        s.semester,
      ]),
    ];
    const csv = toCsv(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="schedules.csv"',
      },
    });
  } catch (e) {
    return internalError(e);
  }
}