import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  const { moduleId } = params;

  const { data: quiz } = await supabaseAdmin
    .from("quizzes")
    .select("id, title, passing_score")
    .eq("module_id", moduleId)
    .maybeSingle();

  if (!quiz) {
    return NextResponse.json({ error: "No quiz for this module" }, { status: 404 });
  }

  const { data: questions } = await supabaseAdmin
    .from("quiz_questions")
    .select("id, question, order_index")
    .eq("quiz_id", quiz.id)
    .order("order_index", { ascending: true });

  const questionIds = (questions || []).map((q) => q.id);
  const { data: options } = await supabaseAdmin
    .from("quiz_options")
    .select("id, question_id, option_text, order_index")
    .in("question_id", questionIds.length > 0 ? questionIds : ["00000000-0000-0000-0000-000000000000"])
    .order("order_index", { ascending: true });
  // Deliberately NOT selecting is_correct above — this is the actual
  // security boundary, not just something hidden in the UI.

  const questionsWithOptions = (questions || []).map((q) => ({
    id: q.id,
    question: q.question,
    options: (options || [])
      .filter((o) => o.question_id === q.id)
      .map((o) => ({ id: o.id, option_text: o.option_text })),
  }));

  return NextResponse.json({
    quizId: quiz.id,
    title: quiz.title,
    passingScore: quiz.passing_score,
    questions: questionsWithOptions,
  });
}
