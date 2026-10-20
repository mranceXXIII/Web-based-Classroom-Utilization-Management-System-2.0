// /api/crud/faculty — GET list / POST create / PUT update (body.id) / DELETE ?id=
// Admin-only (PLAN.md Interface Contract). Deleting a faculty profile also removes its
// linked User account; schedules survive with facultyId=null ("No Faculty"), per schema SetNull.
import { db } from "@/lib/db";
import { guard, parseJson, jsonOk, jsonError, internalError, findByNameCi, checkOrigin } from "@/lib/api";
import { toFacultyDTO } from "@/lib/serialize";
import { facultySchema, idBodySchema, idSchema } from "@/lib/schemas";

export async function GET() {
  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  try {
    const profiles = await db.facultyProfile.findMany({ include: { user: true }, orderBy: { id: "asc" } });
    return jsonOk(profiles.map(toFacultyDTO));
  } catch (e) {
    return internalError(e);
  }
}

export async function POST(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, facultySchema);
  if ("err" in parsed) return parsed.err;
  try {
    const { name, academicRank, advisory } = parsed.data;
    const profiles = await db.facultyProfile.findMany();
    if (findByNameCi(profiles, (p) => p.name, name)) {
      return jsonError(409, "Faculty name already exists");
    }
    const profile = await db.facultyProfile.create({ data: { name, academicRank, advisory } });
    return jsonOk(toFacultyDTO({ ...profile, user: null }));
  } catch (e) {
    return internalError(e);
  }
}

export async function PUT(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, facultySchema.merge(idBodySchema));
  if ("err" in parsed) return parsed.err;
  const { id, name, academicRank, advisory } = parsed.data;
  try {
    const existing = await db.facultyProfile.findUnique({ where: { id } });
    if (!existing) return jsonError(404, "Faculty not found");
    const profiles = await db.facultyProfile.findMany();
    const clash = findByNameCi(profiles, (p) => p.name, name);
    if (clash && clash.id !== id) return jsonError(409, "Faculty name already exists");
    const updated = await db.facultyProfile.update({
      where: { id },
      data: { name, academicRank, advisory },
      include: { user: true },
    });
    return jsonOk(toFacultyDTO(updated));
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
    const existing = await db.facultyProfile.findUnique({ where: { id: id.data } });
    if (!existing) return jsonError(404, "Faculty not found");
    await db.$transaction(async (tx) => {
      // Remove the linked account too so the username can be re-registered (FR-005 stays testable).
      if (existing.userId) await tx.user.delete({ where: { id: existing.userId } });
      await tx.facultyProfile.delete({ where: { id: id.data } });
    });
    return jsonOk({ ok: true });
  } catch (e) {
    return internalError(e);
  }
}