// /api/crud/blocks — GET / POST / PUT (body.id) / DELETE ?id=.
// POST/PUT/DELETE are admin-only. GET is a PUBLIC read (POST-SHIP FIX 3, 2026-10-20):
// student registration (FR-004) fetches the block list pre-auth to populate its block
// dropdown; without a public read it fell back to mock sample blocks.
import { db } from "@/lib/db";
import { guard, parseJson, jsonOk, jsonError, internalError, findByNameCi, checkOrigin } from "@/lib/api";
import { toBlockDTO } from "@/lib/serialize";
import { blockSchema, idBodySchema, idSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const blocks = await db.block.findMany({ include: { advisor: true }, orderBy: { id: "asc" } });
    return jsonOk(blocks.map(toBlockDTO));
  } catch (e) {
    return internalError(e);
  }
}

export async function POST(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, blockSchema);
  if ("err" in parsed) return parsed.err;
  const { name, yearLevel, advisorId } = parsed.data;
  try {
    const blocks = await db.block.findMany();
    if (findByNameCi(blocks, (b) => b.name, name)) {
      return jsonError(409, "Block name already exists");
    }
    if (advisorId != null && !(await db.facultyProfile.findUnique({ where: { id: advisorId } }))) {
      return jsonError(400, "Advisor not found", { advisorId: "Unknown faculty id" });
    }
    const block = await db.block.create({
      data: { name, yearLevel, advisorId: advisorId ?? null },
      include: { advisor: true },
    });
    return jsonOk(toBlockDTO(block));
  } catch (e) {
    return internalError(e);
  }
}

export async function PUT(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, blockSchema.merge(idBodySchema));
  if ("err" in parsed) return parsed.err;
  const { id, name, yearLevel, advisorId } = parsed.data;
  try {
    const existing = await db.block.findUnique({ where: { id } });
    if (!existing) return jsonError(404, "Block not found");
    const blocks = await db.block.findMany();
    const clash = findByNameCi(blocks, (b) => b.name, name);
    if (clash && clash.id !== id) return jsonError(409, "Block name already exists");
    if (advisorId != null && !(await db.facultyProfile.findUnique({ where: { id: advisorId } }))) {
      return jsonError(400, "Advisor not found", { advisorId: "Unknown faculty id" });
    }
    const block = await db.block.update({
      where: { id },
      data: { name, yearLevel, advisorId: advisorId ?? null },
      include: { advisor: true },
    });
    return jsonOk(toBlockDTO(block));
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
    const existing = await db.block.findUnique({ where: { id: id.data } });
    if (!existing) return jsonError(404, "Block not found");
    // Cascades: schedules + roster entries referencing the block are removed (schema onDelete: Cascade).
    await db.block.delete({ where: { id: id.data } });
    return jsonOk({ ok: true });
  } catch (e) {
    return internalError(e);
  }
}