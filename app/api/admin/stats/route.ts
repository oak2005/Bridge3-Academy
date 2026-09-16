import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/auth/verifyAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, role, is_active, created_at");

  const totalUsers = profiles?.length || 0;
  const students = (profiles || []).filter((p) => p.role === "student");
  const mentors = (profiles || []).filter((p) => p.role === "mentor");
  const admins = (profiles || []).filter((p) => p.role === "admin");
  const deactivated = (profiles || []).filter((p) => !p.is_active).length;

  // "Active" = has done something real (a lesson, quiz, or submission)
  // in the last 30 days — not just signed up.
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data: recentProgress } = await supabaseAdmin
    .from("student_progress")
    .select("student_id")
    .gte("completed_at", thirtyDaysAgo);
  const { data: recentAttempts } = await supabaseAdmin
    .from("quiz_attempts")
    .select("student_id")
    .gte("created_at", thirtyDaysAgo);
  const { data: recentSubs } = await supabaseAdmin
    .from("assignment_submissions")
    .select("student_id")
    .gte("created_at", thirtyDaysAgo);

  const activeStudentIds = new Set([
    ...(recentProgress || []).map((r) => r.student_id),
    ...(recentAttempts || []).map((r) => r.student_id),
    ...(recentSubs || []).map((r) => r.student_id),
  ]);

  // Lesson completion rate across the platform.
  const { count: totalLessons } = await supabaseAdmin
    .from("lessons")
    .select("id", { count: "exact", head: true });
  const { count: totalCompletions } = await supabaseAdmin
    .from("student_progress")
    .select("id", { count: "exact", head: true });

  const possibleCompletions = (totalLessons || 0) * students.length;
  const lessonCompletionRate =
    possibleCompletions > 0
      ? Math.round(((totalCompletions || 0) / possibleCompletions) * 100)
      : 0;

  // Mentor activity: reviews completed.
  const { count: reviewedAssignments } = await supabaseAdmin
    .from("assignment_submissions")
    .select("id", { count: "exact", head: true })
    .not("reviewed_at", "is", null);
  const { count: reviewedCapstones } = await supabaseAdmin
    .from("capstone_submissions")
    .select("id", { count: "exact", head: true })
    .not("reviewed_at", "is", null);

  // Still waiting on a mentor.
  const { count: pendingAssignments } = await supabaseAdmin
    .from("assignment_submissions")
    .select("id", { count: "exact", head: true })
    .in("status", ["submitted", "under_review"]);
  const { count: pendingCapstones } = await supabaseAdmin
    .from("capstone_submissions")
    .select("id", { count: "exact", head: true })
    .in("status", ["submitted", "under_review"]);

  const { count: waitlistTotal } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id", { count: "exact", head: true });
  const { count: waitlistConfirmed } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id", { count: "exact", head: true })
    .eq("email_confirmed", true);

  return NextResponse.json({
    users: {
      total: totalUsers,
      students: students.length,
      mentors: mentors.length,
      admins: admins.length,
      deactivated,
      activeLast30Days: activeStudentIds.size,
    },
    learning: {
      totalLessons: totalLessons || 0,
      totalCompletions: totalCompletions || 0,
      lessonCompletionRate,
    },
    mentorActivity: {
      reviewsCompleted: (reviewedAssignments || 0) + (reviewedCapstones || 0),
      pendingReview: (pendingAssignments || 0) + (pendingCapstones || 0),
    },
    waitlist: {
      total: waitlistTotal || 0,
      confirmed: waitlistConfirmed || 0,
    },
  });
}
