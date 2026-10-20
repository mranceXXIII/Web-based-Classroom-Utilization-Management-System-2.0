/**
 * SAMPLE DATA + UI CONSTANTS — frontend scaffolding only.
 *
 * All DTO types are imported from the backend-authored frozen contract
 * (src/lib/types.ts, copied verbatim from docs/INTERFACE-TYPES.md at G2).
 * Status/semester logic is NOT duplicated here anymore: data.ts uses the
 * canonical src/lib/status.ts + src/lib/semester.ts ports.
 *
 * Mock values are SAMPLE ONLY (marked `sample` where not verifiable from
 * docs/EXISTING-PROJECT-ANALYSIS.md §3). Verifiable values reused here:
 *   - faculty names (analysis §3: Gerardo Ribon, Clara Jean Juanzo, Angelica
 *     Rico, Raymund Ipedro, Ma Lourdes Rivero, Ezekiel Roa, Marco Rivas)
 *   - rooms numbered 201–206 (analysis §3: "schedules referencing rooms 201–206")
 *   - counts: 7 blocks, 6 roster entries (analysis §3)
 */
import type {
  BlockDTO, DayCode, FacultyDTO, RosterEntryDTO, RoomDTO, ScheduleDTO, Semester, SubjectDTO,
} from "@/lib/types";

export const DAY_CODES: DayCode[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
export const DAY_LABELS: Record<DayCode, string> = {
  MON: "Mon", TUE: "Tue", WED: "Wed", THU: "Thu", FRI: "Fri", SAT: "Sat", SUN: "Sun",
};
export const SEMESTERS: Semester[] = ["1st Sem", "2nd Sem", "Vacation"];

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60000).toISOString();
}

export const mockFaculty: FacultyDTO[] = [
  { id: 1, name: "Gerardo Ribon", academicRank: "Instructor I" /* sample */, advisory: "BEEd 3-A" /* sample */, lastHeartbeat: minutesAgo(3), hasAccount: true },
  { id: 2, name: "Clara Jean Juanzo", academicRank: "Instructor II" /* sample */, advisory: "BSED 2-B" /* sample */, lastHeartbeat: minutesAgo(42), hasAccount: true },
  { id: 3, name: "Angelica Rico", academicRank: "Instructor I" /* sample */, advisory: "—" /* sample */, lastHeartbeat: minutesAgo(130), hasAccount: false },
  { id: 4, name: "Raymund Ipedro", academicRank: "Assistant Professor I" /* sample */, advisory: "—" /* sample */, lastHeartbeat: minutesAgo(1030), hasAccount: false },
  { id: 5, name: "Ma Lourdes Rivero", academicRank: "Instructor III" /* sample */, advisory: "BEEd 4-A" /* sample */, lastHeartbeat: minutesAgo(2900), hasAccount: true },
  { id: 6, name: "Ezekiel Roa", academicRank: "Instructor I" /* sample */, advisory: "—" /* sample */, lastHeartbeat: null, hasAccount: false },
  { id: 7, name: "Marco Rivas", academicRank: "Instructor II" /* sample */, advisory: "BSED 1-A" /* sample */, lastHeartbeat: minutesAgo(7500), hasAccount: false },
];

export const mockBlocks: BlockDTO[] = [
  { id: 1, name: "BEEd 3-A", yearLevel: "3", advisorId: 1, advisorName: "Gerardo Ribon" }, // sample rows
  { id: 2, name: "BEEd 4-A", yearLevel: "4", advisorId: 5, advisorName: "Ma Lourdes Rivero" },
  { id: 3, name: "BSED 1-A", yearLevel: "1", advisorId: 7, advisorName: "Marco Rivas" },
  { id: 4, name: "BSED 2-B", yearLevel: "2", advisorId: 2, advisorName: "Clara Jean Juanzo" },
  { id: 5, name: "BSED 3-A", yearLevel: "3", advisorId: 3, advisorName: "Angelica Rico" },
  { id: 6, name: "BSED 4-A", yearLevel: "4", advisorId: 4, advisorName: "Raymund Ipedro" },
  { id: 7, name: "BEEd 1-A", yearLevel: "1", advisorId: 6, advisorName: "Ezekiel Roa" },
];

export const mockSubjects: SubjectDTO[] = [
  { id: 1, description: "Professional Education 101" }, // sample rows
  { id: 2, description: "Facilitating Learner-Centered Teaching" },
  { id: 3, description: "Assessment in Learning 1" },
  { id: 4, description: "The Teacher and the School Curriculum" },
  { id: 5, description: "Technology for Teaching and Learning 1" },
  { id: 6, description: "Field Study 1" },
];

export const mockRooms: RoomDTO[] = [
  { id: 1, name: "201" }, { id: 2, name: "202" }, { id: 3, name: "203" },
  { id: 4, name: "204" }, { id: 5, name: "205" }, { id: 6, name: "206" },
];

export const mockRoster: RosterEntryDTO[] = [
  { id: 1, name: "Roster Student One", blockId: 1, blockName: "BEEd 3-A" }, // sample rows
  { id: 2, name: "Roster Student Two", blockId: 1, blockName: "BEEd 3-A" },
  { id: 3, name: "Roster Student Three", blockId: 3, blockName: "BSED 1-A" },
  { id: 4, name: "Roster Student Four", blockId: 4, blockName: "BSED 2-B" },
  { id: 5, name: "Roster Student Five", blockId: 5, blockName: "BSED 3-A" },
  { id: 6, name: "Roster Student Six", blockId: 6, blockName: "BSED 4-A" },
];

export const mockSchedules: ScheduleDTO[] = [
  { id: 1, semester: "1st Sem", startTime: "08:00", endTime: "09:30", days: ["MON", "WED"], facultyId: 1, facultyName: "Gerardo Ribon", blockId: 1, blockName: "BEEd 3-A", subjectId: 1, subjectDescription: "Professional Education 101", roomId: 1, roomName: "201" },
  { id: 2, semester: "1st Sem", startTime: "10:00", endTime: "11:30", days: ["MON", "WED"], facultyId: 2, facultyName: "Clara Jean Juanzo", blockId: 4, blockName: "BSED 2-B", subjectId: 3, subjectDescription: "Assessment in Learning 1", roomId: 1, roomName: "201" },
  { id: 3, semester: "1st Sem", startTime: "13:00", endTime: "14:30", days: ["TUE", "THU"], facultyId: 5, facultyName: "Ma Lourdes Rivero", blockId: 2, blockName: "BEEd 4-A", subjectId: 4, subjectDescription: "The Teacher and the School Curriculum", roomId: 1, roomName: "201" },
  { id: 4, semester: "1st Sem", startTime: "08:00", endTime: "09:30", days: ["TUE", "THU"], facultyId: 3, facultyName: "Angelica Rico", blockId: 5, blockName: "BSED 3-A", subjectId: 2, subjectDescription: "Facilitating Learner-Centered Teaching", roomId: 2, roomName: "202" },
  { id: 5, semester: "1st Sem", startTime: "09:00", endTime: "10:30", days: ["FRI"], facultyId: 4, facultyName: "Raymund Ipedro", blockId: 6, blockName: "BSED 4-A", subjectId: 5, subjectDescription: "Technology for Teaching and Learning 1", roomId: 2, roomName: "202" },
  { id: 6, semester: "1st Sem", startTime: "13:00", endTime: "15:00", days: ["WED"], facultyId: 6, facultyName: "Ezekiel Roa", blockId: 7, blockName: "BEEd 1-A", subjectId: 1, subjectDescription: "Professional Education 101", roomId: 3, roomName: "203" },
  { id: 7, semester: "1st Sem", startTime: "10:00", endTime: "12:00", days: ["MON", "THU"], facultyId: 7, facultyName: "Marco Rivas", blockId: 3, blockName: "BSED 1-A", subjectId: 6, subjectDescription: "Field Study 1", roomId: 3, roomName: "203" },
  { id: 8, semester: "1st Sem", startTime: "08:00", endTime: "10:00", days: ["FRI"], facultyId: 1, facultyName: "Gerardo Ribon", blockId: 2, blockName: "BEEd 4-A", subjectId: 3, subjectDescription: "Assessment in Learning 1", roomId: 4, roomName: "204" },
  { id: 9, semester: "1st Sem", startTime: "15:00", endTime: "17:00", days: ["TUE"], facultyId: 2, facultyName: "Clara Jean Juanzo", blockId: 1, blockName: "BEEd 3-A", subjectId: 5, subjectDescription: "Technology for Teaching and Learning 1", roomId: 5, roomName: "205" },
];



