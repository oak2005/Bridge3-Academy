import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DEFAULT_SITE_SETTINGS } from "@/lib/settings/constants";
import {
  isPlaceholderSupabase,
  findMockSignupByEmail,
  getMockSubmissionsForSignup,
} from "@/lib/waitlist/mockStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId: string | undefined = body.userId;
    const email: string | undefined = body.email ? String(body.email).trim().toLowerCase() : undefined;

    // 1. Determine whether registration is officially open
    let registrationOpen = DEFAULT_SITE_SETTINGS.registrationOpen;
    if (process.env.NEXT_PUBLIC_REGISTRATION_OPEN === "true") {
      registrationOpen = true;
    }

    try {
      const { data: settingsData } = await supabaseAdmin
        .from("site_settings")
        .select("registration_open")
        .eq("id", "default_settings")
        .maybeSingle();

      if (settingsData && settingsData.registration_open !== undefined) {
        registrationOpen = Boolean(settingsData.registration_open);
      }
    } catch (e) {
      // Table or column might not exist yet, fallback to default/env
      console.warn("Could not query registration_open from site_settings:", e);
    }

    // 2. Check if user is an Admin or Mentor
    if (userId || email) {
      let query = supabaseAdmin.from("profiles").select("id, role, is_active, email");
      if (userId) {
        query = query.eq("id", userId);
      } else if (email) {
        query = query.eq("email", email);
      }
      const { data: profile } = await query.maybeSingle();

      if (profile) {
        if (!profile.is_active) {
          return NextResponse.json({
            allowed: false,
            role: profile.role,
            registrationOpen,
            reason: "deactivated",
          });
        }

        // Admins and Mentors ALWAYS have login access
        if (profile.role === "admin" || profile.role === "mentor") {
          return NextResponse.json({
            allowed: true,
            role: profile.role,
            registrationOpen,
            reason: "staff",
          });
        }
      }
    }

    // 3. For student / public users:
    // If registration is NOT open, they have NO access
    if (!registrationOpen) {
      return NextResponse.json({
        allowed: false,
        role: "student",
        registrationOpen: false,
        reason: "registration_closed",
      });
    }

    // 4. If registration IS open: Verify waitlist completion
    if (!email) {
      return NextResponse.json({
        allowed: false,
        role: "student",
        registrationOpen: true,
        reason: "waitlist_not_verified",
      });
    }

    // Check waitlist verification in mock store or Supabase
    if (isPlaceholderSupabase()) {
      const mock = findMockSignupByEmail(email);
      if (!mock || !mock.email_confirmed) {
        return NextResponse.json({
          allowed: false,
          role: "student",
          registrationOpen: true,
          reason: "waitlist_not_verified",
        });
      }

      // Check tasks
      const subs = getMockSubmissionsForSignup(mock.id);
      const verifiedTelegram = subs.some((s) => s.task_type === "telegram" && (s.status === "verified" || s.status === "pending_review"));
      const verifiedTwitter = subs.some((s) => s.task_type === "x_twitter" && (s.status === "verified" || s.status === "pending_review"));

      if (verifiedTelegram && verifiedTwitter) {
        return NextResponse.json({
          allowed: true,
          role: "student",
          registrationOpen: true,
          reason: "verified_waitlist",
        });
      }

      return NextResponse.json({
        allowed: false,
        role: "student",
        registrationOpen: true,
        reason: "waitlist_not_verified",
      });
    }

    // Real Supabase check
    const { data: signup } = await supabaseAdmin
      .from("waitlist_signups")
      .select("id, email, email_confirmed")
      .eq("email", email)
      .maybeSingle();

    if (!signup || !signup.email_confirmed) {
      return NextResponse.json({
        allowed: false,
        role: "student",
        registrationOpen: true,
        reason: "waitlist_not_verified",
      });
    }

    // Query active tasks and submissions to verify completion
    const { data: activeTasks } = await supabaseAdmin
      .from("waitlist_tasks")
      .select("id, weight")
      .eq("is_active", true);

    const { data: submissions } = await supabaseAdmin
      .from("waitlist_verification_submissions")
      .select("task_type, status")
      .eq("waitlist_signup_id", signup.id);

    const latestByTask: Record<string, string> = {};
    for (const sub of submissions || []) {
      if (!latestByTask[sub.task_type]) {
        latestByTask[sub.task_type] = sub.status;
      }
    }

    let isVerified = false;
    if (activeTasks && activeTasks.length > 0) {
      let earnedWeight = 0;
      let totalWeight = 0;
      for (const t of activeTasks) {
        const w = Number(t.weight) || 25;
        totalWeight += w;
        if (t.id === "confirm_email") {
          if (signup.email_confirmed) earnedWeight += w;
        } else {
          const s = latestByTask[t.id];
          if (s === "verified" || s === "pending_review") {
            earnedWeight += w;
          }
        }
      }
      isVerified = totalWeight > 0 && Math.round((earnedWeight / totalWeight) * 100) >= 100;
    } else {
      // If no tasks table, email confirmation grants entry
      isVerified = signup.email_confirmed;
    }

    if (isVerified) {
      return NextResponse.json({
        allowed: true,
        role: "student",
        registrationOpen: true,
        reason: "verified_waitlist",
      });
    }

    return NextResponse.json({
      allowed: false,
      role: "student",
      registrationOpen: true,
      reason: "waitlist_not_verified",
    });
  } catch (err) {
    console.error("Error in /api/auth/check-access:", err);
    return NextResponse.json({
      allowed: false,
      reason: "server_error",
    });
  }
}
