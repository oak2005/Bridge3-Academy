import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const TASK_TYPES = ["telegram", "x_twitter"] as const;
type TaskType = (typeof TASK_TYPES)[number];

const REFERRALS_REQUIRED = 3;

export async function GET(req: NextRequest) {
  const rawId = req.nextUrl.searchParams.get("id")?.trim() || "";
  if (!rawId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  // Sanitize UUID in case spaces were introduced by URL copy/paste
  const id = rawId.replace(/\s+/g, "-");

  const { data: signup, error: signupError } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id, email_confirmed, created_at")
    .eq("id", id)
    .maybeSingle();

  if (signupError || !signup) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Load all verification submissions for this signup
  const { data: submissions, error: submissionsError } = await supabaseAdmin
    .from("waitlist_verification_submissions")
    .select("task_type, status, created_at")
    .eq("waitlist_signup_id", id)
    .order("created_at", { ascending: false });

  if (submissionsError) {
    return NextResponse.json({ error: "Could not load task status" }, { status: 500 });
  }

  const latestByTask: Record<string, string | null> = {};
  for (const row of submissions || []) {
    if (latestByTask[row.task_type] === undefined || latestByTask[row.task_type] === null) {
      latestByTask[row.task_type] = row.status;
    }
  }

  // "Share with 3 friends": fully automatic referral count
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

  // Load active tasks from waitlist_tasks to compute weighted dynamic score
  const { data: activeTasks } = await supabaseAdmin
    .from("waitlist_tasks")
    .select("id, weight")
    .eq("is_active", true);

  let score = 0;
  if (activeTasks && activeTasks.length > 0) {
    let totalWeight = 0;
    let earnedWeight = 0;

    for (const t of activeTasks) {
      const w = Number(t.weight) || 25;
      totalWeight += w;

      if (t.id === "confirm_email") {
        if (signup.email_confirmed) earnedWeight += w;
      } else if (t.id === "referral") {
        if (referralCompleted) earnedWeight += w;
      } else {
        const s = latestByTask[t.id];
        if (s === "verified" || s === "pending_review") {
          earnedWeight += w;
        }
      }
    }

    score = totalWeight > 0 ? Math.min(100, Math.round((earnedWeight / totalWeight) * 100)) : 0;
  } else {
    // Fallback calculation for standard 4 tasks
    let credited = signup.email_confirmed ? 1 : 0;
    if (latestByTask["telegram"] === "verified" || latestByTask["telegram"] === "pending_review") credited += 1;
    if (latestByTask["x_twitter"] === "verified" || latestByTask["x_twitter"] === "pending_review") credited += 1;
    if (referralCompleted) credited += 1;
    score = Math.round((credited / 4) * 100);
  }

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
