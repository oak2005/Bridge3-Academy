import type { SupabaseClient } from "@supabase/supabase-js";
import { StudentStats } from "./xp";
import { computeStreak } from "./streak";

/**
 * Computes a student's full stats. Pass supabaseBrowser to compute the
 * CURRENT signed-in student's own stats (relies on RLS letting you read
 * your own rows). Pass supabaseAdmin to compute ANY student's stats from
 * a server-side route (bypasses RLS) — used by the public portfolio page
 * and the leaderboard, which both need to show other students' data.
 */
export async function computeStudentStats(
  supabase: SupabaseClient,
  studentId: string
): Promise<StudentStats> {
  // Lessons
  const { data: progress } = await supabase
    .from("student_progress")
    .select("lesson_id, completed_at")
    .eq("student_id", studentId);
  const lessonsCompleted = progress?.length || 0;

  // Quizzes
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, passed, created_at")
    .eq("student_id", studentId);
  const quizzesPassed = new Set(
    (attempts || []).filter((a) => a.passed).map((a) => a.quiz_id)
  ).size;

  // Assignments
  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select("assignment_id, status, created_at")
    .eq("student_id", studentId);
  const assignmentsSubmitted = new Set((submissions || []).map((s) => s.assignment_id)).size;
  const assignmentsApproved = new Set(
    (submissions || []).filter((s) => s.status === "approved").map((s) => s.assignment_id)
  ).size;

  // Capstones
  const { data: capstones } = await supabase
    .from("capstone_submissions")
    .select("track_id, status, created_at")
    .eq("student_id", studentId);
  const capstonesSubmitted = new Set((capstones || []).map((c) => c.track_id)).size;
  const capstonesApproved = new Set(
    (capstones || []).filter((c) => c.status === "approved").map((c) => c.track_id)
  ).size;

  // Streak — union of activity dates across all three sources.
  const activityTimestamps: string[] = [
    ...(progress || []).map((p) => p.completed_at as string),
    ...(attempts || []).map((a) => a.created_at as string),
    ...(submissions || []).map((s) => s.created_at as string),
  ];
  const currentStreak = computeStreak(activityTimestamps);

  // Any-track-complete check, reusing the same tables/relationships as
  // lib/progress/trackCompletion.ts, computed fresh here since this
  // function needs to work against an arbitrary student via either
  // client.
  const { data: tracks } = await supabase.from("tracks").select("id, requires_capstone");
  let anyTrackComplete = false;

  for (const track of tracks || []) {
    const { data: modules } = await supabase.from("modules").select("id").eq("track_id", track.id);
    const moduleIds = (modules || []).map((m) => m.id);
    if (moduleIds.length === 0) continue;

    const { data: lessons } = await supabase.from("lessons").select("id").in("module_id", moduleIds);
    const lessonIds = (lessons || []).map((l) => l.id);
    const lessonsDoneForTrack = (progress || []).filter((p) =>
      lessonIds.includes(p.lesson_id)
    ).length;

    const { data: quizzes } = await supabase.from("quizzes").select("id").in("module_id", moduleIds);
    const quizIds = (quizzes || []).map((q) => q.id);
    const quizzesPassedForTrack = new Set(
      (attempts || []).filter((a) => a.passed && quizIds.includes(a.quiz_id)).map((a) => a.quiz_id)
    ).size;

    const { data: assignmentsForTrack } = await supabase
      .from("assignments")
      .select("id")
      .in("module_id", moduleIds);
    const assignmentIds = (assignmentsForTrack || []).map((a) => a.id);
    const assignmentsApprovedForTrack = new Set(
      (submissions || [])
        .filter((s) => s.status === "approved" && assignmentIds.includes(s.assignment_id))
        .map((s) => s.assignment_id)
    ).size;

    const capstoneOk =
      !track.requires_capstone ||
      (capstones || []).some((c) => c.track_id === track.id && c.status === "approved");

    if (
      lessonsDoneForTrack === lessonIds.length &&
      quizzesPassedForTrack === quizIds.length &&
      assignmentsApprovedForTrack === assignmentIds.length &&
      capstoneOk
    ) {
      anyTrackComplete = true;
      break;
    }
  }

  return {
    lessonsCompleted,
    quizzesPassed,
    assignmentsSubmitted,
    assignmentsApproved,
    capstonesSubmitted,
    capstonesApproved,
    currentStreak,
    anyTrackComplete,
  };
}
