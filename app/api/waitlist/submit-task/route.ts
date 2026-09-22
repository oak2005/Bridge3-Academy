import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { waitlistSignupId, taskType, submissionText, screenshotPath } = body || {};

  if (!waitlistSignupId || !taskType || typeof taskType !== "string") {
    return NextResponse.json({ error: "Invalid submission payload." }, { status: 400 });
  }

  // Confirm the signup actually exists before attaching a submission to it.
  const { data: signup } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id")
    .eq("id", waitlistSignupId)
    .maybeSingle();

  if (!signup) {
    return NextResponse.json({ error: "Waitlist entry not found." }, { status: 404 });
  }

  // Always inserted as pending_review — this route never sets "verified".
  // Only the admin review tool (built in a later phase) can do that.
  const { error } = await supabaseAdmin.from("waitlist_verification_submissions").insert({
    waitlist_signup_id: waitlistSignupId,
    task_type: taskType,
    submission_text: submissionText || null,
    screenshot_path: screenshotPath || null,
    status: "pending_review",
  });

  if (error) {
    return NextResponse.json({ error: "Could not save submission." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: "pending_review" });
}
