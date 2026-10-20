// /api/crud/subjects — GET / POST / PUT (body.id) / DELETE ?id= (admin-only).
import { db } from "@/lib/db";
import { guard, parseJson, jsonOk, jsonError, internalError, checkOrigin } from "@/lib/api";
import { toSubjectDTO } from "@/lib/serialize";
import { subjectSchema, idBodySchema, idSchema } from "@/lib/schemas";

export async function GET() {
  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  try {
    const subjects = await db.subject.findMany({ orderBy: { id: "asc" } });
    return jsonOk(subjects.map(toSubjectDTO));
  } catch (e) {
    return internalError(e);
  }
}

export async function POST(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, subjectSchema);
  if ("err" in parsed) return parsed.err;
  try {
    const clash = await db.subject.findUnique({ where: { description: parsed.data.description } });
    if (clash) return jsonError(409, "Subject already exists");
    const subject = await db.subject.create({ data: { description: parsed.data.description } });
    return jsonOk(toSubjectDTO(subject));
  } catch (e) {
    return internalError(e);
  }
}

export async function PUT(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, subjectSchema.merge(idBodySchema));
  if ("err" in parsed) return parsed.err;
  const { id, description } = parsed.data;
  try {
    const existing = await db.subject.findUnique({ where: { id } });
    if (!existing) return jsonError(404, "Subject not found");
    const clash = await db.subject.findUnique({ where: { description } });
    if (clash && clash.id !== id) return jsonError(409, "Subject already exists");
    const subject = await db.subject.update({ where: { id }, data: { description } });
    return jsonOk(toSubjectDTO(subject));
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
    const existing = await db.subject.findUnique({ where: { id: id.data } });
    if (!existing) return jsonError(404, "Subject not found");
    // Cascades: schedules referencing the subject are removed (schema onDelete: Cascade).
    await db.subject.delete({ where: { id: id.data } });
    return jsonOk({ ok: true });
  } catch (e) {
    return internalError(e);
  }
}