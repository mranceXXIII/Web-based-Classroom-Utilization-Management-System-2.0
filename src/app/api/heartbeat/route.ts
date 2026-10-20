// GET /api/heartbeat — FR-022 (faculty only). Updates FacultyProfile.lastHeartbeat (legacy
// heartbeat.php: UPDATE it_faculty SET timestamp = NOW()). PLAN contract: { data: { lastHeartbeat } }.
import { db } from "@/lib/db";
import { guard, jsonOk, jsonError, internalError } from "@/lib/api";

export async function GET() {
  const g = await guard("FACULTY");
  if ("err" in g) return g.err;
  try {
    const profile = await db.facultyProfile.findUnique({
      where: { userId: Number(g.session.sub) },
    });
    if (!profile) return jsonError(404, "Faculty profile not found for this account");
    const lastHeartbeat = new Date();
    await db.facultyProfile.update({
      where: { id: profile.id },
      data: { lastHeartbeat },
    });
    return jsonOk({ lastHeartbeat: lastHeartbeat.toISOString() });
  } catch (e) {
    return internalError(e);
  }
}