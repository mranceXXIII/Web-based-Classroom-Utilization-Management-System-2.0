// /api/crud/rooms — GET / POST / PUT (body.id) / DELETE ?id= (admin-only).
import { db } from "@/lib/db";
import { guard, parseJson, jsonOk, jsonError, internalError, checkOrigin } from "@/lib/api";
import { toRoomDTO } from "@/lib/serialize";
import { roomSchema, idBodySchema, idSchema } from "@/lib/schemas";

export async function GET() {
  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  try {
    const rooms = await db.room.findMany({ orderBy: { id: "asc" } });
    return jsonOk(rooms.map(toRoomDTO));
  } catch (e) {
    return internalError(e);
  }
}

export async function POST(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, roomSchema);
  if ("err" in parsed) return parsed.err;
  try {
    const clash = await db.room.findUnique({ where: { name: parsed.data.name } });
    if (clash) return jsonError(409, "Room already exists");
    const room = await db.room.create({ data: { name: parsed.data.name } });
    return jsonOk(toRoomDTO(room));
  } catch (e) {
    return internalError(e);
  }
}

export async function PUT(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, roomSchema.merge(idBodySchema));
  if ("err" in parsed) return parsed.err;
  const { id, name } = parsed.data;
  try {
    const existing = await db.room.findUnique({ where: { id } });
    if (!existing) return jsonError(404, "Room not found");
    const clash = await db.room.findUnique({ where: { name } });
    if (clash && clash.id !== id) return jsonError(409, "Room already exists");
    const room = await db.room.update({ where: { id }, data: { name } });
    return jsonOk(toRoomDTO(room));
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
    const existing = await db.room.findUnique({ where: { id: id.data } });
    if (!existing) return jsonError(404, "Room not found");
    // Cascades: schedules referencing the room are removed (schema onDelete: Cascade).
    await db.room.delete({ where: { id: id.data } });
    return jsonOk({ ok: true });
  } catch (e) {
    return internalError(e);
  }
}