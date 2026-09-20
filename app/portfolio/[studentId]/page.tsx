import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { computeStudentStats } from "@/lib/gamification/computeStudentStats";
import { calculateXP } from "@/lib/gamification/xp";
import { BADGES } from "@/lib/gamification/badges";
import { ShareButton } from "@/components/portfolio/ShareButton";

// Without this, Next.js can cache this page's data fetches and serve a
// frozen snapshot from whenever it first rendered — a real student's XP,
// badges, and links would then silently go stale for every future
// visitor. This forces a fresh read on every request instead.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: { studentId: string };
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { studentId } = params;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, track")
    .eq("id", studentId)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const stats = await computeStudentStats(supabaseAdmin, studentId);
  const xp = calculateXP(stats);
  const earnedBadges = BADGES.filter((b) => b.check(stats));

  const { data: links } = await supabaseAdmin
    .from("portfolio_links")
    .select("id, label, url")
    .eq("student_id", studentId)
    .order("order_index", { ascending: true });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const shareUrl = `${siteUrl}/portfolio/${studentId}`;

  // Certificates (Phase 12)
  const { data: certificates } = await supabaseAdmin
    .from("certificates")
    .select("id, certificate_number, track_id")
    .eq("student_id", studentId);

  return (
    <div className="mx-auto max-w-content px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{profile.full_name || "Bridge3 Academy Student"}</h1>
          <p className="mt-2 text-ink-muted">
            {profile.track ? `Track: ${profile.track}` : "Bridge3 Academy Student"}
          </p>
          <div className="mt-2">
            {certificates && certificates.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {certificates.map((c) => (
                  <a
                    key={c.id}
                    href={`/certificates/${c.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#C5A059]/40 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold text-[#8C6D37] transition-colors hover:bg-[#C5A059]/20"
                  >
                    🎓 Verified Certificate · {c.certificate_number} ↗
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">
                Certification: Coursework in progress
              </p>
            )}
          </div>
        </div>
        <ShareButton url={shareUrl} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded border border-border bg-paper-raised p-6 text-center">
          <p className="font-display text-3xl text-ink">{xp}</p>
          <p className="mt-1 text-sm text-ink-muted">Total XP</p>
        </div>
        <div className="rounded border border-border bg-paper-raised p-6 text-center">
          <p className="font-display text-3xl text-ink">{stats.assignmentsApproved}</p>
          <p className="mt-1 text-sm text-ink-muted">Assignments completed</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl text-ink">Skill Badges</h2>
      {earnedBadges.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No badges earned yet.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {earnedBadges.map((b) => (
            <div key={b.id} className="rounded border border-accent bg-accent-tint p-4">
              <p className="text-sm font-semibold text-ink">🏅 {b.label}</p>
              <p className="mt-1 text-xs text-ink-soft">{b.description}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 font-display text-xl text-ink">Proof of Work</h2>
      {!links || links.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No links shared yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-accent-hover underline"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
