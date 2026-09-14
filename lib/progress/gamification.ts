import type { SupabaseClient } from "@supabase/supabase-js";

export interface GamificationReport {
  studentId: string;
  xp: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  assignmentsApproved: number;
  assignmentsSubmitted: number;
  capstonesSubmitted: number;
  capstonesApproved: number;
  currentStreak: number;
  badges: string[];
}

// XP formula — documented here, in one place, for easy tuning later.
const XP_PER_LESSON = 10;
const XP_PER_QUIZ_PASSED = 25;
const XP_PER_ASSIGNMENT_APPROVED = 30;
const XP_PER_CAPSTONE_APPROVED = 100;

/**
 * Deliberately NOT a stored "points ledger" a student could write to
 * directly. Every number here is derived from data that's already
 * independently trustworthy: student_progress (a student can only mark
 * their own lessons), quiz_attempts (graded entirely server-side, Phase 8),
 * and assignment/capstone approval (which nobody can grant themselves —
 * that requires a mentor, Phase 10). Computing XP fresh each time means
 * there's no separate score a student could inflate that doesn't match
 * what they've actually, verifiably done.
 */
export async function computeGamification(
  client: SupabaseClient,
  studentId: string
): Promise<GamificationReport> {
  const { count: lessonsCompleted } = await client
    .from("student_progress")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId);

  const { data: passedAttempts } = await client
    .from("quiz_attempts")
    .select("quiz_id")
    .eq("student_id", studentId)
    .eq("passed", true);
  const quizzesPassed = new Set((passedAttempts || []).map((a) => a.quiz_id)).size;

  const { data: assignmentSubs } = await client
    .from("assignment_submissions")
    .select("assignment_id, status")
    .eq("student_id", studentId);
  const assignmentsSubmitted = new Set((assignmentSubs || []).map((a) => a.assignment_id)).size;
  const assignmentsApproved = new Set(
    (assignmentSubs || []).filter((a) => a.status === "approved").map((a) => a.assignment_id)
  ).size;

  const { data: capstoneSubs } = await client
    .from("capstone_submissions")
    .select("track_id, status")
    .eq("student_id", studentId);
  const capstonesSubmitted = new Set((capstoneSubs || []).map((c) => c.track_id)).size;
  const capstonesApproved = new Set(
    (capstoneSubs || []).filter((c) => c.status === "approved").map((c) => c.track_id)
  ).size;

  const xp =
    (lessonsCompleted || 0) * XP_PER_LESSON +
    quizzesPassed * XP_PER_QUIZ_PASSED +
    assignmentsApproved * XP_PER_ASSIGNMENT_APPROVED +
    capstonesApproved * XP_PER_CAPSTONE_APPROVED;

  // Streak: consecutive calendar days (UTC) with at least one piece of
  // activity, counting back from today. A streak is still "alive" if
  // there's activity today OR yesterday — it isn't broken by a single
  // in-progress day, only by a full missed day.
  const activityDates = new Set<string>();
  const { data: progressDates } = await client
    .from("student_progress")
    .select("completed_at")
    .eq("student_id", studentId);
  const { data: quizDates } = await client
    .from("quiz_attempts")
    .select("created_at")
    .eq("student_id", studentId);
  const { data: assignmentDates } = await client
    .from("assignment_submissions")
    .select("created_at")
    .eq("student_id", studentId);

  for (const row of progressDates || []) activityDates.add(row.completed_at.slice(0, 10));
  for (const row of quizDates || []) activityDates.add(row.created_at.slice(0, 10));
  for (const row of assignmentDates || []) activityDates.add(row.created_at.slice(0, 10));

  let currentStreak = 0;
  const today = new Date();
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  // If there's no activity today, the streak can still be alive via
  // yesterday — start the count from yesterday instead.
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!activityDates.has(todayKey)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (activityDates.has(cursor.toISOString().slice(0, 10))) {
    currentStreak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const badges: string[] = [];
  if ((lessonsCompleted || 0) >= 1) badges.push("First Steps");
  if (quizzesPassed >= 1) badges.push("Quiz Whiz");
  if (assignmentsSubmitted >= 1) badges.push("Contributor");
  if (assignmentsApproved >= 1) badges.push("Approved Work");
  if (capstonesSubmitted >= 1) badges.push("Capstone Builder");
  if (currentStreak >= 3) badges.push("3-Day Streak");
  if (currentStreak >= 7) badges.push("7-Day Streak");

  return {
    studentId,
    xp,
    lessonsCompleted: lessonsCompleted || 0,
    quizzesPassed,
    assignmentsApproved,
    assignmentsSubmitted,
    capstonesSubmitted,
    capstonesApproved,
    currentStreak,
    badges,
  };
}
