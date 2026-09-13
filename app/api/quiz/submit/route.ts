import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const studentId = userData.user.id;

  const body = await req.json().catch(() => null);
  const moduleId = body?.moduleId as string | undefined;
  const answers = body?.answers as Record<string, string> | undefined; // { questionId: optionId }

  if (!moduleId || !answers) {
    return NextResponse.json({ error: "Missing quiz answers." }, { status: 400 });
  }

  const { data: quiz } = await supabaseAdmin
    .from("quizzes")
    .select("id, passing_score")
    .eq("module_id", moduleId)
    .maybeSingle();

  if (!quiz) {
    return NextResponse.json({ error: "No quiz for this module." }, { status: 404 });
  }

  const { data: questions } = await supabaseAdmin
    .from("quiz_questions")
    .select("id")
    .eq("quiz_id", quiz.id);

  const questionIds = (questions || []).map((q) => q.id);
  const { data: correctOptions } = await supabaseAdmin
    .from("quiz_options")
    .select("id, question_id")
    .in("question_id", questionIds.length > 0 ? questionIds : ["00000000-0000-0000-0000-000000000000"])
    .eq("is_correct", true);

  const correctByQuestion = new Map((correctOptions || []).map((o) => [o.question_id, o.id]));

  let correctCount = 0;
  for (const questionId of questionIds) {
    const submittedOptionId = answers[questionId];
    if (submittedOptionId && submittedOptionId === correctByQuestion.get(questionId)) {
      correctCount += 1;
    }
  }

  const total = questionIds.length || 1;
  const score = Math.round((correctCount / total) * 100);
  const passed = score >= quiz.passing_score;

  const { error: insertError } = await supabaseAdmin.from("quiz_attempts").insert({
    quiz_id: quiz.id,
    student_id: studentId,
    score,
    passed,
  });

  if (insertError) {
    return NextResponse.json({ error: "Could not save your result." }, { status: 500 });
  }

  return NextResponse.json({
    score,
    passed,
    correctCount,
    totalCount: total,
    passingScore: quiz.passing_score,
  });
}
