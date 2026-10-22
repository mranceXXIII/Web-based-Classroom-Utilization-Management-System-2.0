// /api/crud/subjects — GET / POST / PUT (body.id) / DELETE ?id=.
// Mutations are admin-only; GET accepts any authenticated role (the schedules
// dashboards read subjects through the data layer). Subjects are grouped per
// department and year level (POST-SHIP: department/year added to the model).
import { db } from "@/lib/db";
import { guard, parseJson, jsonOk, jsonError, internalError, checkOrigin } from "@/lib/api";
import { toSubjectDTO } from "@/lib/serialize";
import { subjectSchema, idBodySchema, idSchema } from "@/lib/schemas";

export async function GET() {
  const g = await guard("ADMIN", "FACULTY", "STUDENT");
  if ("err" in g) return g.err;
  try {
    const subjects = await db.subject.findMany({
      include: { department: true },
      orderBy: [{ departmentId: "asc" }, { yearLevel: "asc" }, { description: "asc" }],
    });
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
  const { description, yearLevel, departmentId } = parsed.data;
  try {
    const clash = await db.subject.findUnique({ where: { description } });
    if (clash) return jsonError(409, "Subject already exists");
    if (departmentId != null && !(await db.department.findUnique({ where: { id: departmentId } }))) {
      return jsonError(400, "Department not found", { departmentId: "Unknown department id" });
    }
    const subject = await db.subject.create({
      data: { description, yearLevel, departmentId: departmentId ?? null },
      include: { department: true },
    });
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
  const { id, description, yearLevel, departmentId } = parsed.data;
  try {
    const existing = await db.subject.findUnique({ where: { id } });
    if (!existing) return jsonError(404, "Subject not found");
    const clash = await db.subject.findUnique({ where: { description } });
    if (clash && clash.id !== id) return jsonError(409, "Subject already exists");
    if (departmentId != null && !(await db.department.findUnique({ where: { id: departmentId } }))) {
      return jsonError(400, "Department not found", { departmentId: "Unknown department id" });
    }
    const subject = await db.subject.update({
      where: { id },
      data: { description, yearLevel, departmentId: departmentId ?? null },
      include: { department: true },
    });
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