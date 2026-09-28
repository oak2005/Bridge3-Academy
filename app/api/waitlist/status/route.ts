import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  isPlaceholderSupabase,
  findMockSignupById,
  mockSignups,
  getMockSubmissionsForSignup,
} from "@/lib/waitlist/mockStore";

const REFERRALS_REQUIRED = 1;

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  const visible = local.length <= 2 ? local[0] : local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export async function GET(req: NextRequest) {
  const rawId = req.nextUrl.searchParams.get("id")?.trim() || "";
  if (!rawId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  // Sanitize UUID in case spaces were introduced by URL copy/paste
  const id = rawId.replace(/\s+/g, "-");

  if (isPlaceholderSupabase()) {
    let mockSignup = findMockSignupById(id);
    if (!mockSignup) {
      mockSignup = {
        id,
        email: "scholar@example.com",
        email_confirmed: false,
        confirmation_token: "mock-token",
        referred_by: null,
        created_at: new Date().toISOString(),
      };
      mockSignups.set(id, mockSignup);
    }
    const subs = getMockSubmissionsForSignup(id);
    const latestByTask: Record<string, string | null> = {};
    for (const row of subs) {
      if (latestByTask[row.task_type] === undefined) {
        latestByTask[row.task_type] = row.status;
      }
    }
    let score = mockSignup.email_confirmed ? 25 : 0;
    if (latestByTask["telegram"] === "verified" || latestByTask["telegram"] === "pending_review") score += 25;
    if (latestByTask["x_twitter"] === "verified" || latestByTask["x_twitter"] === "pending_review") score += 25;

    return NextResponse.json({
      id: mockSignup.id,
      emailConfirmed: mockSignup.email_confirmed,
      tasks: latestByTask,
      referral: {
        count: 0,
        required: 1,
        completed: false,
        code: "B3-DEMO12",
        earnedXP: 0,
        maxXP: 500,
        invitees: [],
      },
      score,
    });
  }

  // Load signup
  let { data: signup, error: signupError } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id, email, email_confirmed, created_at, referral_code")
    .eq("id", id)
    .maybeSingle();

  if (signupError) {
    // If referral_code column doesn't exist yet, query without it
    const fallbackRes = await supabaseAdmin
      .from("waitlist_signups")
      .select("id, email, email_confirmed, created_at")
      .eq("id", id)
      .maybeSingle();
    signup = fallbackRes.data ? { ...fallbackRes.data, referral_code: null } : null;
    signupError = fallbackRes.error;
  }

  if (signupError || !signup) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If referral_code is missing, generate and persist one
  let referralCode = signup.referral_code;
  if (!referralCode) {
    referralCode = "B3-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await supabaseAdmin
        .from("waitlist_signups")
        .update({ referral_code: referralCode })
        .eq("id", id);
    } catch {
      // Column may not exist yet
    }
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

  // Query referred signups
  const { data: inviteeRows, error: referralError } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id, email, email_confirmed, created_at")
    .eq("referred_by", id)
    .order("created_at", { ascending: false });

  if (referralError) {
    return NextResponse.json({ error: "Could not load referral status" }, { status: 500 });
  }

  const confirmedInvitees = (inviteeRows || []).filter((r) => r.email_confirmed);
  const effectiveReferredCount = confirmedInvitees.length;
  const referralCompleted = effectiveReferredCount >= REFERRALS_REQUIRED;

  const maskedInvitees = (inviteeRows || []).map((inv) => ({
    id: inv.id,
    maskedEmail: maskEmail(inv.email),
    confirmed: inv.email_confirmed,
    createdAt: inv.created_at,
  }));

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
      code: referralCode,
      earnedXP: Math.min(effectiveReferredCount, 25) * 20,
      maxXP: 500,
      invitees: maskedInvitees,
    },
    score,
  });
}
