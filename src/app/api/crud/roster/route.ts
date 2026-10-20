// /api/crud/roster — GET / POST / PUT (body.id) / DELETE ?id= (admin-only).
// blockId 0/null = "no block recorded" (legacy block=''), accepts any block at registration.
import { db } from "@/lib/db";
import { guard, parseJson, jsonOk, jsonError, internalError, checkOrigin } from "@/lib/api";
import { toRosterEntryDTO } from "@/lib/serialize";
import { rosterSchema, idBodySchema, idSchema } from "@/lib/schemas";

async function resolveBlockId(blockId: number | null | undefined): Promise<number | null | "invalid"> {
  if (blockId == null || blockId === 0) return null;
  const block = await db.block.findUnique({ where: { id: blockId } });
  return block ? block.id : "invalid";
}

export async function GET() {
  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  try {
    const roster = await db.rosterEntry.findMany({ include: { block: true }, orderBy: { id: "asc" } });
    return jsonOk(roster.map(toRosterEntryDTO));
  } catch (e) {
    return internalError(e);
  }
}

export async function POST(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, rosterSchema);
  if ("err" in parsed) return parsed.err;
  try {
    const blockId = await resolveBlockId(parsed.data.blockId);
    if (blockId === "invalid") return jsonError(400, "Invalid references", { blockId: "Unknown block id" });
    const roster = await db.rosterEntry.findMany({ where: { name: parsed.data.name } });
    if (roster.some((r) => r.blockId === blockId && r.name.toLowerCase() === parsed.data.name.toLowerCase())) {
      return jsonError(409, "Roster entry already exists");
    }
    const entry = await db.rosterEntry.create({
      data: { name: parsed.data.name, blockId },
      include: { block: true },
    });
    return jsonOk(toRosterEntryDTO(entry));
  } catch (e) {
    return internalError(e);
  }
}

export async function PUT(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  const parsed = await parseJson(req, rosterSchema.merge(idBodySchema));
  if ("err" in parsed) return parsed.err;
  const { id, name, blockId } = parsed.data;
  try {
    const existing = await db.rosterEntry.findUnique({ where: { id } });
    if (!existing) return jsonError(404, "Roster entry not found");
    const resolvedBlockId = await resolveBlockId(blockId);
    if (resolvedBlockId === "invalid") return jsonError(400, "Invalid references", { blockId: "Unknown block id" });
    const entry = await db.rosterEntry.update({
      where: { id },
      data: { name, blockId: resolvedBlockId },
      include: { block: true },
    });
    return jsonOk(toRosterEntryDTO(entry));
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
    const existing = await db.rosterEntry.findUnique({ where: { id: id.data } });
    if (!existing) return jsonError(404, "Roster entry not found");
    await db.rosterEntry.delete({ where: { id: id.data } });
    return jsonOk({ ok: true });
  } catch (e) {
    return internalError(e);
  }
}