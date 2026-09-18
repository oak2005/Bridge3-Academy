import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin, logAdminAction } from "@/lib/auth/verifyAdmin";
import { jsonNoStore } from "@/lib/http/noStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: submissions } = await supabaseAdmin
    .from("waitlist_verification_submissions")
    .select("id, waitlist_signup_id, task_type, submission_text, screenshot_path, status, created_at")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  const signupIds = Array.from(new Set((submissions || []).map((s) => s.waitlist_signup_id)));
  const { data: signups } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id, email")
    .in("id", signupIds.length > 0 ? signupIds : ["00000000-0000-0000-0000-000000000000"]);
  const emailById = new Map((signups || []).map((s) => [s.id, s.email]));

  const withUrls = await Promise.all(
    (submissions || []).map(async (s) => {
      let screenshotUrl: string | null = null;
      if (s.screenshot_path) {
        const { data } = await supabaseAdmin.storage
          .from("waitlist-verification")
          .createSignedUrl(s.screenshot_path, 300);
        screenshotUrl = data?.signedUrl || null;
      }
      return {
        id: s.id,
        email: emailById.get(s.waitlist_signup_id) || "Unknown",
        taskType: s.task_type,
        submissionText: s.submission_text,
        screenshotUrl,
        createdAt: s.created_at,
      };
    })
  );

  return jsonNoStore({ submissions: withUrls });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  const { submissionId, status } = body || {};

  if (!submissionId || (status !== "verified" && status !== "rejected")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("waitlist_verification_submissions")
    .update({ status, reviewed_by: auth.userId, reviewed_at: new Date().toISOString() })
    .eq("id", submissionId);

  if (error) {
    return NextResponse.json({ error: "Could not save review." }, { status: 500 });
  }

  await logAdminAction({
    actorId: auth.userId,
    action: `waitlist_task_${status}`,
    targetType: "waitlist_verification_submission",
    targetId: submissionId,
  });

  return NextResponse.json({ ok: true });
}
