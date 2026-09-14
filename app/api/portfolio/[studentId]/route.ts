import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { computeStudentStats } from "@/lib/gamification/computeStudentStats";
import { calculateXP } from "@/lib/gamification/xp";
import { BADGES } from "@/lib/gamification/badges";

export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string } }
) {
  const { studentId } = params;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, track")
    .eq("id", studentId)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stats = await computeStudentStats(supabaseAdmin, studentId);
  const xp = calculateXP(stats);
  const earnedBadges = BADGES.filter((b) => b.check(stats)).map((b) => ({
    id: b.id,
    label: b.label,
    description: b.description,
  }));

  const { data: links } = await supabaseAdmin
    .from("portfolio_links")
    .select("id, label, url")
    .eq("student_id", studentId)
    .order("order_index", { ascending: true });

  // Deliberately minimal: name, track, XP, badges, an approved-assignment
  // COUNT (not content), and links the student chose to make public.
  // Never returns email, raw submissions, or anything else private.
  return NextResponse.json({
    fullName: profile.full_name || "Bridge3 Academy Student",
    track: profile.track,
    certificationLevel: null,
    xp,
    badges: earnedBadges,
    assignmentsApprovedCount: stats.assignmentsApproved,
    links: links || [],
  });
}
