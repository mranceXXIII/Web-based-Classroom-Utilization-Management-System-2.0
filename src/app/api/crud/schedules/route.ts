// /api/crud/schedules — GET / POST / PUT (body.id) / DELETE ?id= (admin-only).
// days wire format: DayCode[]; stored comma-joined (INTERFACE-TYPES.md). facultyId 0/null = no faculty.
import { db } from "@/lib/db";
import { guard, parseJson, jsonOk, jsonError, internalError, checkOrigin } from "@/lib/api";
import { toScheduleDTO } from "@/lib/serialize";
import { scheduleSchema, idBodySchema, idSchema } from "@/lib/schemas";

async function assertFks(data: {
  facultyId?: number | null; blockId: number; subjectId: number; roomId: number;
}): Promise<Record<string, string> | null> {
  const fields: Record<string, string> = {};
  if (data.facultyId != null && data.facultyId !== 0) {
    const f = await db.facultyProfile.findUnique({ where: { id: data.facultyId } });
    if (!f) fields.facultyId = "Unknown faculty id";
  }
  if (!(await db.block.findUnique({ where: { id: data.blockId } }))) fields.blockId = "Unknown block id";
  if (!(await db.subject.findUnique({ where: { id: data.subjectId } }))) fields.subjectId = "Unknown subject id";
  if (!(await db.room.findUnique({ where: { id: data.roomId } }))) fields.roomId = "Unknown room id";
  return Object.keys(fields).length ? fields : null;
}

export async function GET() {
  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  try {
    const schedules = await db.schedule.findMany({
      include: { faculty: true, block: true, subject: true, room: true },
      orderBy: [{ semester: "asc" }, { startTime: "asc" }, { id: "asc" }],
    });
    return jsonOk(schedules.map(toScheduleDTO));
  } catch (e) {
    return internalError(e);
  }
}

export async function POST(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, scheduleSchema);
  if ("err" in parsed) return parsed.err;
  const { semester, startTime, endTime, days, facultyId, blockId, subjectId, roomId } = parsed.data;
  try {
    const fields = await assertFks({ facultyId, blockId, subjectId, roomId });
    if (fields) return jsonError(400, "Invalid references", fields);
    const schedule = await db.schedule.create({
      data: {
        semester, startTime, endTime,
        days: days.join(","),
        facultyId: facultyId != null && facultyId !== 0 ? facultyId : null,
        blockId, subjectId, roomId,
      },
      include: { faculty: true, block: true, subject: true, room: true },
    });
    return jsonOk(toScheduleDTO(schedule));
  } catch (e) {
    return internalError(e);
  }
}

export async function PUT(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, scheduleSchema.merge(idBodySchema));
  if ("err" in parsed) return parsed.err;
  const { id, semester, startTime, endTime, days, facultyId, blockId, subjectId, roomId } = parsed.data;
  try {
    const existing = await db.schedule.findUnique({ where: { id } });
    if (!existing) return jsonError(404, "Schedule not found");
    const fields = await assertFks({ facultyId, blockId, subjectId, roomId });
    if (fields) return jsonError(400, "Invalid references", fields);
    const schedule = await db.schedule.update({
      where: { id },
      data: {
        semester, startTime, endTime,
        days: days.join(","),
        facultyId: facultyId != null && facultyId !== 0 ? facultyId : null,
        blockId, subjectId, roomId,
      },
      include: { faculty: true, block: true, subject: true, room: true },
    });
    return jsonOk(toScheduleDTO(schedule));
  } catch (e) {
    return internalError(e);
  }
}

export async function DELETE(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const id = idSchema.safeParse(new URL(req.url).searchParams.get("id"));
  if (!id.success) return jsonError(400, "Query parameter 'id' (positive integer) is required");
  try {
    const existing = await db.schedule.findUnique({ where: { id: id.data } });
    if (!existing) return jsonError(404, "Schedule not found");
    await db.schedule.delete({ where: { id: id.data } });
    return jsonOk({ ok: true });
  } catch (e) {
    return internalError(e);
  }
}