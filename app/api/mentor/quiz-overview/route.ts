import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyMentor } from "@/lib/auth/verifyMentor";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await verifyMentor(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name");
  const { data: quizzes } = await supabaseAdmin.from("quizzes").select("id");
  const totalQuizzes = quizzes?.length || 0;

  const { data: attempts } = await supabaseAdmin
    .from("quiz_attempts")
    .select("student_id, quiz_id, passed");

  const overview = (profiles || []).map((p) => {
    const studentAttempts = (attempts || []).filter((a) => a.student_id === p.id);
    const passedQuizIds = new Set(
      studentAttempts.filter((a) => a.passed).map((a) => a.quiz_id)
    );
    return {
      studentId: p.id,
      name: p.full_name || "Student",
      quizzesPassed: passedQuizIds.size,
      totalQuizzes,
      totalAttempts: studentAttempts.length,
    };
  });

  return NextResponse.json({ overview });
}
