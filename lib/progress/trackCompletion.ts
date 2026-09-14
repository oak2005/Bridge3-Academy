import type { SupabaseClient } from "@supabase/supabase-js";

export interface TrackCompletionReport {
  trackId: string;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  passedQuizzes: number;
  totalAssignments: number;
  approvedAssignments: number;
  requiresCapstone: boolean;
  capstoneApproved: boolean;
  isComplete: boolean;
}

/**
 * Computes whether a track is complete for a given student. This is the
 * single source of truth for "done" — Certification (Phase 12) calls this
 * exact function rather than re-implementing the logic, so there's no risk
 * of the two disagreeing later.
 *
 * Takes ANY Supabase client (the browser client for a student checking
 * their own progress, or the server-only admin client when computing this
 * for someone else — e.g. a public portfolio page in Phase 9, or
 * Certification in Phase 12). There is deliberately only one
 * implementation of this logic, used everywhere, rather than a client
 * version and a server version that could quietly drift apart over time.
 *
 * A track is complete when ALL of the following are true:
 * - Every lesson in every module has a student_progress row.
 * - Every module that HAS a quiz has at least one PASSING attempt
 *   (an earlier failed attempt doesn't block completion once a later one
 *   passes).
 * - Every assignment in every module has a submission with status
 *   'approved' — note this means no track can be fully complete until
 *   Phase 10 (Mentor) can actually approve something; that's expected,
 *   not a bug, since there's no way to approve anything yet.
 * - If the track requires a capstone, there's an approved capstone
 *   submission for this student + track.
 */
export async function computeTrackCompletion(
  client: SupabaseClient,
  studentId: string,
  trackId: string
): Promise<TrackCompletionReport> {
  const { data: track } = await client
    .from("tracks")
    .select("id, requires_capstone")
    .eq("id", trackId)
    .maybeSingle();

  const requiresCapstone = track?.requires_capstone || false;

  const { data: modules } = await client
    .from("modules")
    .select("id")
    .eq("track_id", trackId);
  const moduleIds = (modules || []).map((m) => m.id);

  if (moduleIds.length === 0) {
    return {
      trackId,
      totalLessons: 0,
      completedLessons: 0,
      totalQuizzes: 0,
      passedQuizzes: 0,
      totalAssignments: 0,
      approvedAssignments: 0,
      requiresCapstone,
      capstoneApproved: false,
      isComplete: false,
    };
  }

  // Lessons
  const { data: lessons } = await client
    .from("lessons")
    .select("id")
    .in("module_id", moduleIds);
  const lessonIds = (lessons || []).map((l) => l.id);

  let completedLessons = 0;
  if (lessonIds.length > 0) {
    const { count } = await client
      .from("student_progress")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .in("lesson_id", lessonIds);
    completedLessons = count || 0;
  }

  // Quizzes
  const { data: quizzes } = await client
    .from("quizzes")
    .select("id")
    .in("module_id", moduleIds);
  const quizIds = (quizzes || []).map((q) => q.id);

  let passedQuizzes = 0;
  if (quizIds.length > 0) {
    const { data: attempts } = await client
      .from("quiz_attempts")
      .select("quiz_id")
      .eq("student_id", studentId)
      .eq("passed", true)
      .in("quiz_id", quizIds);
    passedQuizzes = new Set((attempts || []).map((a) => a.quiz_id)).size;
  }

  // Assignments
  const { data: assignments } = await client
    .from("assignments")
    .select("id")
    .in("module_id", moduleIds);
  const assignmentIds = (assignments || []).map((a) => a.id);

  let approvedAssignments = 0;
  if (assignmentIds.length > 0) {
    const { data: submissions } = await client
      .from("assignment_submissions")
      .select("assignment_id")
      .eq("student_id", studentId)
      .eq("status", "approved")
      .in("assignment_id", assignmentIds);
    approvedAssignments = new Set((submissions || []).map((s) => s.assignment_id)).size;
  }

  // Capstone
  let capstoneApproved = false;
  if (requiresCapstone) {
    const { data: capstone } = await client
      .from("capstone_submissions")
      .select("id")
      .eq("student_id", studentId)
      .eq("track_id", trackId)
      .eq("status", "approved")
      .limit(1)
      .maybeSingle();
    capstoneApproved = !!capstone;
  }

  const isComplete =
    completedLessons === lessonIds.length &&
    passedQuizzes === quizIds.length &&
    approvedAssignments === assignmentIds.length &&
    (!requiresCapstone || capstoneApproved);

  return {
    trackId,
    totalLessons: lessonIds.length,
    completedLessons,
    totalQuizzes: quizIds.length,
    passedQuizzes,
    totalAssignments: assignmentIds.length,
    approvedAssignments,
    requiresCapstone,
    capstoneApproved,
    isComplete,
  };
}
