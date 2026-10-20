// POST /api/auth/register/admin — FR-006: name must exist in faculty records and the
// ADMIN account count is capped at 3 (legacy adminRegister.php semantics + message).
// FIND-007 remediation: cap check + user creation run inside one interactive $transaction
// (SQLite serializes writes) so concurrent registrations cannot exceed the cap; a concurrent
// username collision surfaces as a Prisma P2002 → 409.
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { jsonOk, jsonError, parseJson, internalError, findUserByUsername, findByNameCi, checkOrigin } from "@/lib/api";
import { toUserDTO } from "@/lib/serialize";
import { namePasswordSchema } from "@/lib/schemas";

const MAX_ADMIN_ACCOUNTS = 3;

export async function POST(req: Request) {
  const originErr = checkOrigin(req);
  if (originErr) return originErr;
  const parsed = await parseJson(req, namePasswordSchema);
  if ("err" in parsed) return parsed.err;
  const { name, password } = parsed.data;
  try {
    const profiles = await db.facultyProfile.findMany();
    const profile = findByNameCi(profiles, (p) => p.name, name);
    if (!profile) return jsonError(404, "Name not found in the faculty records");
    const existing = await findUserByUsername(profile.name);
    if (existing) return jsonError(409, "This name is already registered");
    const user = await db.$transaction(async (tx) => {
      // Re-check the cap INSIDE the write transaction (SQLite serializes writers → no TOCTOU).
      const adminCount = await tx.user.count({ where: { role: "ADMIN" } });
      if (adminCount >= MAX_ADMIN_ACCOUNTS) {
        throw new Error("ADMIN_CAP_REACHED");
      }
      return tx.user.create({
        data: { username: profile.name, passwordHash: hashPassword(password), role: "ADMIN" },
      });
    });
    return jsonOk({ user: toUserDTO(user) });
  } catch (e) {
    if (e instanceof Error && e.message === "ADMIN_CAP_REACHED") {
      return jsonError(409, "Cannot register. Maximum admin accounts reached.");
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonError(409, "This name is already registered");
    }
    return internalError(e);
  }
}