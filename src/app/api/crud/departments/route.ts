// /api/crud/departments — GET / POST / PUT (body.id) / DELETE ?id=.
// GET is a public read (department names only — consumed by the Blocks module's
// department grouping and select options). POST/PUT/DELETE are admin-only.
// DELETE is refused while blocks still reference the department (409), mirroring
// the FK-guarded delete behaviour of the other modules.
import { db } from "@/lib/db";
import { guard, parseJson, jsonOk, jsonError, internalError, findByNameCi, checkOrigin } from "@/lib/api";
import { departmentSchema, idBodySchema, idSchema } from "@/lib/schemas";

function toDepartmentDTO(d: { id: number; name: string }) {
  return { id: d.id, name: d.name };
}

export async function GET() {
  try {
    const departments = await db.department.findMany({ orderBy: { id: "asc" } });
    return jsonOk(departments.map(toDepartmentDTO));
  } catch (e) {
    return internalError(e);
  }
}

export async function POST(req: Request) {
  const originErr = checkOrigin(req);
  if (originErr) return originErr;
  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, departmentSchema);
  if ("err" in parsed) return parsed.err;
  const { name } = parsed.data;
  try {
    const departments = await db.department.findMany();
    if (findByNameCi(departments, (d) => d.name, name)) {
      return jsonError(409, "Department already exists");
    }
    const department = await db.department.create({ data: { name } });
    return jsonOk(toDepartmentDTO(department));
  } catch (e) {
    return internalError(e);
  }
}

export async function PUT(req: Request) {
  const originErr = checkOrigin(req);
  if (originErr) return originErr;
  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, departmentSchema.merge(idBodySchema));
  if ("err" in parsed) return parsed.err;
  const { id, name } = parsed.data;
  try {
    const existing = await db.department.findUnique({ where: { id } });
    if (!existing) return jsonError(404, "Department not found");
    const departments = await db.department.findMany();
    const clash = findByNameCi(departments, (d) => d.name, name);
    if (clash && clash.id !== id) return jsonError(409, "Department already exists");
    const updated = await db.department.update({ where: { id }, data: { name } });
    return jsonOk(toDepartmentDTO(updated));
  } catch (e) {
    return internalError(e);
  }
}

export async function DELETE(req: Request) {
  const originErr = checkOrigin(req);
  if (originErr) return originErr;
  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const id = idSchema.safeParse(new URL(req.url).searchParams.get("id"));
  if (!id.success) return jsonError(400, "Query parameter 'id' (positive integer) is required");
  try {
    const existing = await db.department.findUnique({
      where: { id: id.data },
      include: { _count: { select: { blocks: true } } },
    });
    if (!existing) return jsonError(404, "Department not found");
    if (existing._count.blocks > 0) {
      return jsonError(409, `Department still has ${existing._count.blocks} block(s) — move or delete them first`);
    }
    await db.department.delete({ where: { id: id.data } });
    return jsonOk({ ok: true });
  } catch (e) {
    return internalError(e);
  }
}
