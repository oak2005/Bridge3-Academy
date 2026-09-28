import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isPlaceholderSupabase } from "@/lib/waitlist/mockStore";

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  const visible = local.length <= 2 ? local[0] : local.slice(0, 3);
  return `${visible}***@${domain}`;
}

export interface WaitlistLeaderboardEntry {
  rank: number;
  id: string;
  maskedEmail: string;
  verifiedReferrals: number;
  xp: number;
}

export async function GET(req: NextRequest) {
  const currentId = req.nextUrl.searchParams.get("currentId")?.trim() || "";

  if (isPlaceholderSupabase()) {
    const mockLeaders: WaitlistLeaderboardEntry[] = [
      { rank: 1, id: "mock-1", maskedEmail: "ch***@gmail.com", verifiedReferrals: 18, xp: 180 },
      { rank: 2, id: "mock-2", maskedEmail: "am***@yahoo.com", verifiedReferrals: 14, xp: 140 },
      { rank: 3, id: "mock-3", maskedEmail: "em***@outlook.com", verifiedReferrals: 11, xp: 110 },
      { rank: 4, id: "mock-4", maskedEmail: "fa***@gmail.com", verifiedReferrals: 8, xp: 80 },
      { rank: 5, id: "mock-5", maskedEmail: "kw***@proton.me", verifiedReferrals: 6, xp: 60 },
      { rank: 6, id: "mock-6", maskedEmail: "ol***@gmail.com", verifiedReferrals: 4, xp: 40 },
      { rank: 7, id: "mock-7", maskedEmail: "za***@gmail.com", verifiedReferrals: 3, xp: 30 },
      { rank: 8, id: "mock-8", maskedEmail: "ba***@outlook.com", verifiedReferrals: 2, xp: 20 },
    ];

    let currentUserRank: { rank: number | null; verifiedReferrals: number; xp: number } | null = null;
    if (currentId) {
      const foundIdx = mockLeaders.findIndex((l) => l.id === currentId);
      if (foundIdx >= 0) {
        currentUserRank = {
          rank: foundIdx + 1,
          verifiedReferrals: mockLeaders[foundIdx].verifiedReferrals,
          xp: mockLeaders[foundIdx].xp,
        };
      } else {
        currentUserRank = { rank: null, verifiedReferrals: 0, xp: 0 };
      }
    }

    return NextResponse.json({
      leaderboard: mockLeaders,
      currentUserRank,
    });
  }

  try {
    // 1. Fetch all confirmed invitees that have a referred_by link
    const { data: confirmedInvitees, error: inviteesError } = await supabaseAdmin
      .from("waitlist_signups")
      .select("referred_by")
      .not("referred_by", "is", null)
      .eq("email_confirmed", true);

    if (inviteesError) {
      console.error("Failed to load waitlist referrals:", inviteesError);
      return NextResponse.json({ leaderboard: [], currentUserRank: null });
    }

    // 2. Count confirmed referrals per referrer
    const countsByReferrer: Record<string, number> = {};
    for (const row of confirmedInvitees || []) {
      if (row.referred_by) {
        countsByReferrer[row.referred_by] = (countsByReferrer[row.referred_by] || 0) + 1;
      }
    }

    // Sort referrers by count descending
    const sortedReferrerIds = Object.keys(countsByReferrer).sort(
      (a, b) => countsByReferrer[b] - countsByReferrer[a]
    );

    const topIds = sortedReferrerIds.slice(0, 20);

    // If currentId is provided and not in topIds, include it to fetch user's info
    const idsToFetch = new Set(topIds);
    if (currentId && !idsToFetch.has(currentId)) {
      idsToFetch.add(currentId);
    }

    // 3. Fetch signups to get email
    let signupsMap: Record<string, { email: string }> = {};
    if (idsToFetch.size > 0) {
      const { data: signups } = await supabaseAdmin
        .from("waitlist_signups")
        .select("id, email")
        .in("id", Array.from(idsToFetch));

      for (const s of signups || []) {
        signupsMap[s.id] = { email: s.email };
      }
    }

    const leaderboard: WaitlistLeaderboardEntry[] = topIds.map((id, index) => {
      const count = countsByReferrer[id] || 0;
      const email = signupsMap[id]?.email || "scholar@bridge3.org";
      return {
        rank: index + 1,
        id,
        maskedEmail: maskEmail(email),
        verifiedReferrals: count,
        xp: count * 10,
      };
    });

    let currentUserRank: { rank: number | null; verifiedReferrals: number; xp: number } | null = null;
    if (currentId) {
      const userCount = countsByReferrer[currentId] || 0;
      const userRankIndex = sortedReferrerIds.indexOf(currentId);
      currentUserRank = {
        rank: userRankIndex >= 0 ? userRankIndex + 1 : null,
        verifiedReferrals: userCount,
        xp: userCount * 10,
      };
    }

    return NextResponse.json({
      leaderboard,
      currentUserRank,
    });
  } catch (err) {
    console.error("Waitlist leaderboard error:", err);
    return NextResponse.json({ leaderboard: [], currentUserRank: null }, { status: 500 });
  }
}
