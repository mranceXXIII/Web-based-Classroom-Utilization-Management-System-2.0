// POST /api/auth/register/faculty — FR-005: activates a password only when the faculty row
// exists and has no user account yet (legacy facultyRegister.php: password IS NULL/'' gate).
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { jsonOk, jsonError, parseJson, internalError, findUserByUsername, findByNameCi, checkOrigin } from "@/lib/api";
import { toUserDTO } from "@/lib/serialize";
import { namePasswordSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const originErr = checkOrigin(req);
  if (originErr) return originErr;
  const parsed = await parseJson(req, namePasswordSchema);
  if ("err" in parsed) return parsed.err;
  const { name, password } = parsed.data;
  try {
    const profiles = await db.facultyProfile.findMany();
    const profile = findByNameCi(profiles, (p) => p.name, name);
    if (!profile) return jsonError(404, "Faculty record not found");
    if (profile.userId !== null) return jsonError(409, "Faculty already has an account");
    const existing = await findUserByUsername(profile.name);
    if (existing) return jsonError(409, "Username already taken");
    const user = await db.user.create({
      data: { username: profile.name, passwordHash: hashPassword(password), role: "FACULTY" },
    });
    await db.facultyProfile.update({ where: { id: profile.id }, data: { userId: user.id } });
    return jsonOk({ user: toUserDTO(user) });
  } catch (e) {
    return internalError(e);
  }
}