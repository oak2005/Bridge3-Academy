import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyMentor } from "@/lib/auth/verifyMentor";

const VALID_TYPES = ["assignment", "capstone"];
const VALID_STATUSES = ["approved", "needs_revision"];

export async function POST(req: NextRequest) {
  const auth = await verifyMentor(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  const { type, submissionId, status, feedback } = body || {};

  if (!VALID_TYPES.includes(type) || !VALID_STATUSES.includes(status) || !submissionId) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const table = type === "assignment" ? "assignment_submissions" : "capstone_submissions";

  const { error } = await supabaseAdmin
    .from(table)
    .update({
      status,
      feedback: feedback || null,
      reviewed_by: auth.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) {
    return NextResponse.json({ error: "Could not save your review." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
