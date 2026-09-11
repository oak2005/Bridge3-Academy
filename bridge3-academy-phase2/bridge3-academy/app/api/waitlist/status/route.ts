import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const TASK_TYPES = ["telegram", "x_twitter"] as const;
type TaskType = (typeof TASK_TYPES)[number];

const REFERRALS_REQUIRED = 3;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data: signup, error: signupError } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id, email_confirmed, created_at")
    .eq("id", id)
    .maybeSingle();

  if (signupError || !signup) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Telegram + X: still manual review, read from submissions.
  const { data: submissions, error: submissionsError } = await supabaseAdmin
    .from("waitlist_verification_submissions")
    .select("task_type, status, created_at")
    .eq("waitlist_signup_id", id)
    .order("created_at", { ascending: false });

  if (submissionsError) {
    return NextResponse.json({ error: "Could not load task status" }, { status: 500 });
  }

  const latestByTask: Record<TaskType, string | null> = {
    telegram: null,
    x_twitter: null,
  };
  for (const row of submissions || []) {
    const type = row.task_type as TaskType;
    if (latestByTask[type] === null) {
      latestByTask[type] = row.status;
    }
  }

  // "Share with 3 friends": fully automatic. Count real, confirmed
  // signups that used this person's referral link — no manual review,
  // no external API, just counting our own data.
  const { count: referredCount, error: referralError } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", id)
    .eq("email_confirmed", true);

  if (referralError) {
    return NextResponse.json({ error: "Could not load referral status" }, { status: 500 });
  }

  const effectiveReferredCount = referredCount ?? 0;
  const referralCompleted = effectiveReferredCount >= REFERRALS_REQUIRED;

  // Score = tasks that are Completed or Pending Review, out of 4 total
  // (email + telegram + x + referral) — matches the original brief.
  // Referral only ever counts as fully complete or not — there's no
  // "pending" state for something that's counted automatically.
  let creditedTasks = signup.email_confirmed ? 1 : 0;
  for (const type of TASK_TYPES) {
    const status = latestByTask[type];
    if (status === "verified" || status === "pending_review") creditedTasks += 1;
  }
  if (referralCompleted) creditedTasks += 1;
  const score = Math.round((creditedTasks / 4) * 100);

  return NextResponse.json({
    id: signup.id,
    emailConfirmed: signup.email_confirmed,
    tasks: latestByTask,
    referral: {
      count: effectiveReferredCount,
      required: REFERRALS_REQUIRED,
      completed: referralCompleted,
    },
    score,
  });
}
