// POST /api/auth/register/student — FR-004: succeeds only when the name exists in RosterEntry
// AND the chosen block matches (entries without a recorded block accept any block, mirroring
// legacy student_register.php which verified the name only). 409 on duplicate registration.
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { jsonOk, jsonError, parseJson, internalError, findUserByUsername, findByNameCi, checkOrigin } from "@/lib/api";
import { toUserDTO } from "@/lib/serialize";
import { studentRegisterSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const originErr = checkOrigin(req);
  if (originErr) return originErr;
  const parsed = await parseJson(req, studentRegisterSchema);
  if ("err" in parsed) return parsed.err;
  const { name, block, password } = parsed.data;
  try {
    const entries = await db.rosterEntry.findMany({ include: { block: true } });
    const entry = findByNameCi(entries, (r) => r.name, name);
    if (!entry) return jsonError(404, "Name not found in the roster");
    if (entry.blockId !== null && (entry.block?.name ?? "").toLowerCase() !== block.toLowerCase()) {
      return jsonError(400, "Block does not match roster record", {
        block: "Block does not match the roster entry for this name",
      });
    }
    const existing = await findUserByUsername(entry.name);
    if (existing) return jsonError(409, "This name is already registered");
    const user = await db.user.create({
      data: { username: entry.name, passwordHash: hashPassword(password), role: "STUDENT" },
    });
    return jsonOk({ user: toUserDTO(user) });
  } catch (e) {
    return internalError(e);
  }
}