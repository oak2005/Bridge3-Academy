import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { computeStudentStats } from "@/lib/gamification/computeStudentStats";

// Same caching trap as the public portfolio page — without this, Next.js
// can cache this route's response and serve stale rankings to everyone.
export const dynamic = "force-dynamic";
import { calculateXP } from "@/lib/gamification/xp";
import { jsonNoStore } from "@/lib/http/noStore";

export async function GET() {
  const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name");

  const entries = await Promise.all(
    (profiles || []).map(async (p) => {
      const stats = await computeStudentStats(supabaseAdmin, p.id);
      return { id: p.id, name: p.full_name || "Student", xp: calculateXP(stats) };
    })
  );

  const top = entries
    .filter((e) => e.xp > 0)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);

  return jsonNoStore({ leaderboard: top });
}
