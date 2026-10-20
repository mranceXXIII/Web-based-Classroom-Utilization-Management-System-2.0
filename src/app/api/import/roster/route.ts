// POST /api/import/roster — FR-014 (admin-only). Multipart CSV upload, header `name,block`.
// Upserts RosterEntry by (name, blockId). Empty block column → no block recorded (null).
// Unknown non-empty block names are rejected per row (no auto-creation of blocks).
import { db } from "@/lib/db";
import { guard, jsonOk, jsonError, internalError, checkOrigin } from "@/lib/api";
import { parseCsv } from "@/lib/csv";

const MAX_CSV_BYTES = 2_000_000;

export async function POST(req: Request) {

  const originErr = checkOrigin(req);
  if (originErr) return originErr;  const g = await guard("ADMIN");
  if ("err" in g) return g.err;
  try {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return jsonError(400, "Expected multipart/form-data with a 'file' field");
    }
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonError(400, "CSV file required in form field 'file'");
    }
    if (file.size > MAX_CSV_BYTES) return jsonError(400, "CSV file too large (max 2 MB)");

    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) return jsonError(400, "CSV is empty");
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const nameIdx = header.indexOf("name");
    const blockIdx = header.indexOf("block");
    if (nameIdx === -1 || blockIdx === -1) {
      return jsonError(400, "CSV header must contain 'name' and 'block'", {
        header: `Got: ${rows[0].join(",") || "(empty)"}`,
      });
    }

    const blocks = await db.block.findMany();
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const name = (row[nameIdx] ?? "").trim();
      const blockName = (row[blockIdx] ?? "").trim();
      if (!name) {
        errors.push(`row ${i + 1}: missing name`);
        continue;
      }
      let blockId: number | null = null;
      if (blockName) {
        const block =
          blocks.find((b) => b.name === blockName) ??
          blocks.find((b) => b.name.toLowerCase() === blockName.toLowerCase());
        if (!block) {
          errors.push(`row ${i + 1}: unknown block '${blockName}'`);
          continue;
        }
        blockId = block.id;
      }
      const existing = await db.rosterEntry.findFirst({ where: { name, blockId } });
      if (existing) {
        skipped++;
      } else {
        await db.rosterEntry.create({ data: { name, blockId } });
        created++;
      }
    }
    return jsonOk({ created, updated, skipped, errors });
  } catch (e) {
    return internalError(e);
  }
}