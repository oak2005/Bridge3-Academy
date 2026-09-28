"use client";

import { useEffect, useState } from "react";

export interface WaitlistLeaderboardEntry {
  rank: number;
  id: string;
  maskedEmail: string;
  verifiedReferrals: number;
  xp: number;
}

export function WaitlistLeaderboard({ waitlistId }: { waitlistId?: string }) {
  const [leaderboard, setLeaderboard] = useState<WaitlistLeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<{
    rank: number | null;
    verifiedReferrals: number;
    xp: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = waitlistId
      ? `/api/waitlist/leaderboard?currentId=${encodeURIComponent(waitlistId)}`
      : `/api/waitlist/leaderboard`;

    fetch(url, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
        if (data.currentUserRank) {
          setCurrentUserRank(data.currentUserRank);
        }
      })
      .catch((err) => console.error("Failed to load waitlist leaderboard:", err))
      .finally(() => setLoading(false));
  }, [waitlistId]);

  return (
    <div className="mt-12 rounded-2xl border border-border bg-paper-raised p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
              Scholar Referral Challenge
            </span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink">
            Top Inviters Leaderboard
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Earn <strong className="text-accent">10 XP</strong> per verified referral. Top inviters gain guaranteed VIP cohort placement and early scholarship review.
          </p>
        </div>

        {currentUserRank && (
          <div className="flex shrink-0 items-center gap-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Your Position</p>
              <p className="font-display text-lg font-bold text-ink">
                {currentUserRank.rank ? `#${currentUserRank.rank}` : "Unranked"}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Referral XP</p>
              <p className="font-display text-lg font-bold text-accent">
                {currentUserRank.xp} XP
              </p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-ink-muted animate-pulse">
          Loading leaderboard rankings…
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="py-12 text-center text-xs text-ink-muted">
          No verified referrals yet. Share your invite link below to claim Rank #1!
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-ink-muted">
                <th className="pb-3 pl-2 font-semibold">Rank</th>
                <th className="pb-3 font-semibold">Scholar</th>
                <th className="pb-3 text-center font-semibold">Verified Invites</th>
                <th className="pb-3 pr-2 text-right font-semibold">Referral XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {leaderboard.map((entry) => {
                const isCurrent = waitlistId && entry.id === waitlistId;
                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isCurrent
                        ? "bg-accent/10 font-semibold text-ink"
                        : "hover:bg-paper text-ink-soft"
                    }`}
                  >
                    <td className="py-3 pl-2">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                          entry.rank === 1
                            ? "bg-amber-400/20 text-amber-500 border border-amber-400/40"
                            : entry.rank === 2
                            ? "bg-slate-300/20 text-slate-400 border border-slate-300/40"
                            : entry.rank === 3
                            ? "bg-amber-700/20 text-amber-600 border border-amber-700/40"
                            : "bg-paper border border-border text-ink-muted"
                        }`}
                      >
                        {entry.rank === 1
                          ? "🥇"
                          : entry.rank === 2
                          ? "🥈"
                          : entry.rank === 3
                          ? "🥉"
                          : entry.rank}
                      </span>
                    </td>
                    <td className="py-3 font-mono">
                      <span className="flex items-center gap-2">
                        <span>{entry.maskedEmail}</span>
                        {isCurrent && (
                          <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-contrast">
                            YOU
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold text-ink">
                      {entry.verifiedReferrals}
                    </td>
                    <td className="py-3 pr-2 text-right font-mono font-bold text-accent">
                      +{entry.xp} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-dashed border-border bg-paper/50 p-4 text-xs text-ink-muted flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>💡 <strong>Tip:</strong> Each verified referral awards +10 XP immediately upon email confirmation and syncs with your permanent Student Profile when the cohort opens.</span>
      </div>
    </div>
  );
}
