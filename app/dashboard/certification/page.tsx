"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";
import { computeTrackCompletion, TrackCompletionReport } from "@/lib/progress/trackCompletion";

interface Track {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  track_type: string;
  coming_soon: boolean;
  requires_capstone: boolean;
  order_index: number;
}

interface Certificate {
  id: string;
  certificate_number: string;
  track_id: string;
  student_id: string;
  issued_at: string;
  verification_hash: string;
  metadata: {
    studentName?: string;
    trackTitle?: string;
    completionDate?: string;
    [key: string]: unknown;
  };
}

export default function CertificationDashboardPage() {
  const { session, profile, loading: authLoading } = useProfile();
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [completionMap, setCompletionMap] = useState<Record<string, TrackCompletionReport>>({});
  const [claimingTrackId, setClaimingTrackId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [celebrationTrack, setCelebrationTrack] = useState<string | null>(null);

  const loadData = async (userId: string) => {
    try {
      // 1. Fetch tracks
      const { data: trackRows } = await supabaseBrowser
        .from("tracks")
        .select("*")
        .order("order_index", { ascending: true });

      const allTracks = (trackRows || []) as Track[];
      setTracks(allTracks);

      // 2. Fetch student's existing certificates
      const { data: certRows } = await supabaseBrowser
        .from("certificates")
        .select("*")
        .eq("student_id", userId);

      setCertificates((certRows || []) as Certificate[]);

      // 3. Compute completion report for active tracks
      const reportMap: Record<string, TrackCompletionReport> = {};
      for (const t of allTracks) {
        if (!t.coming_soon) {
          const report = await computeTrackCompletion(supabaseBrowser, userId, t.id);
          reportMap[t.id] = report;
        }
      }
      setCompletionMap(reportMap);
    } catch (err) {
      console.error("Failed to load certification data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadData(session.user.id);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [session, authLoading]);

  const handleClaim = async (trackId: string, trackTitle: string) => {
    setActionError(null);
    setClaimingTrackId(trackId);

    try {
      // Always fetch fresh session token
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setActionError("You must be signed in to claim a certificate.");
        setClaimingTrackId(null);
        return;
      }

      const res = await fetch("/api/certificates/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Could not claim certificate.");
        setClaimingTrackId(null);
        return;
      }

      setCelebrationTrack(trackTitle);
      if (session?.user?.id) {
        await loadData(session.user.id);
      }
    } catch (err) {
      setActionError("An unexpected error occurred. Please try again.");
    } finally {
      setClaimingTrackId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-paper-raised" />
        <div className="mt-4 h-4 w-96 animate-pulse rounded bg-paper-raised" />
        <div className="mt-8 space-y-4">
          <div className="h-32 w-full animate-pulse rounded-xl border border-border bg-paper-raised" />
          <div className="h-32 w-full animate-pulse rounded-xl border border-border bg-paper-raised" />
        </div>
      </div>
    );
  }

  const certificateByTrack = new Map(certificates.map((c) => [c.track_id, c]));

  const earnedTracks = tracks.filter((t) => certificateByTrack.has(t.id));
  const claimableTracks = tracks.filter(
    (t) => !certificateByTrack.has(t.id) && completionMap[t.id]?.isComplete
  );
  const inProgressTracks = tracks.filter(
    (t) => !t.coming_soon && !certificateByTrack.has(t.id) && !completionMap[t.id]?.isComplete
  );
  const comingSoonTracks = tracks.filter((t) => t.coming_soon);

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-ink">Certifications</h1>
        <p className="mt-2 max-w-prose text-sm text-ink-muted leading-relaxed">
          Verifiable credentials representing completed tracks, passed assessments, and mentor-approved projects. Each certificate is cryptographically hashed and publicly verifiable.
        </p>
      </div>

      {/* Action Error Notification */}
      {actionError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
          <p className="font-semibold">Unable to issue certificate:</p>
          <p className="mt-1">{actionError}</p>
        </div>
      )}

      {/* Celebration Banner */}
      {celebrationTrack && (
        <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-bold">🎉 Congratulations!</p>
              <p className="mt-1 text-sm">
                Your Certificate of Completion for <strong>{celebrationTrack}</strong> has been issued and verified.
              </p>
            </div>
            <button
              onClick={() => setCelebrationTrack(null)}
              className="text-xs font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Section 1: Ready to Claim */}
      {claimableTracks.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-display text-lg font-semibold text-ink">
              Ready to Claim ({claimableTracks.length})
            </h2>
          </div>
          <div className="mt-3 grid gap-4">
            {claimableTracks.map((track) => (
              <div
                key={track.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border-2 border-emerald-400/60 bg-emerald-50/50 p-5 dark:border-emerald-700/50 dark:bg-emerald-950/30"
              >
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    100% Completed
                  </span>
                  <h3 className="mt-0.5 text-lg font-bold text-ink">{track.title}</h3>
                  <p className="mt-1 text-xs text-ink-muted">
                    All lessons, quizzes, assignments, and capstone requirements satisfied.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleClaim(track.id, track.title)}
                  disabled={claimingTrackId === track.id}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-500 disabled:opacity-50"
                >
                  {claimingTrackId === track.id ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Issuing Credential...
                    </>
                  ) : (
                    <>🎓 Claim Certificate</>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Earned Certificates */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">
          Earned Certificates ({earnedTracks.length})
        </h2>

        {earnedTracks.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border bg-paper-raised/40 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-tint text-accent">
              📜
            </div>
            <p className="mt-3 font-semibold text-ink text-sm">No certificates earned yet</p>
            <p className="mt-1 text-xs text-ink-muted max-w-sm mx-auto">
              Finish all modules in a track and have your assignments approved by a mentor to unlock your credentials.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {earnedTracks.map((track) => {
              const cert = certificateByTrack.get(track.id)!;
              const issueDate = new Date(cert.issued_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={cert.id}
                  className="flex flex-col justify-between rounded-xl border border-[#C5A059]/40 bg-gradient-to-br from-paper-raised to-paper p-5 shadow-sm transition-all hover:border-[#C5A059]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-[#C5A059]/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#8C6D37]">
                        {cert.certificate_number}
                      </span>
                      <span className="text-[11px] text-ink-muted">Issued {issueDate}</span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-ink">{track.title}</h3>
                    <p className="mt-1 text-xs text-ink-muted line-clamp-2">
                      {track.description || "Mastery in Bitcoin fundamentals and Stacks ecosystem."}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
                    <Link
                      href={`/certificates/${cert.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent-hover hover:underline"
                    >
                      View &amp; Verify ↗
                    </Link>
                    <Link
                      href={`/certificates/${cert.id}`}
                      target="_blank"
                      className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-paper-hover"
                    >
                      Print PDF
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: In Progress Tracks */}
      <div className="mt-12">
        <h2 className="font-display text-lg font-semibold text-ink">
          In Progress ({inProgressTracks.length})
        </h2>
        <div className="mt-3 grid gap-4">
          {inProgressTracks.map((track) => {
            const report = completionMap[track.id];
            const lessonsPct =
              report && report.totalLessons > 0
                ? Math.round((report.completedLessons / report.totalLessons) * 100)
                : 0;

            return (
              <div
                key={track.id}
                className="rounded-xl border border-border bg-paper-raised p-5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-ink">{track.title}</h3>
                    <p className="mt-0.5 text-xs text-ink-muted">{track.description}</p>
                  </div>
                  <Link
                    href="/dashboard/my-courses"
                    className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-paper px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-paper-hover"
                  >
                    Continue Track →
                  </Link>
                </div>

                {report && (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 pt-3 border-t border-border/60 text-xs">
                    <div>
                      <p className="text-ink-muted">Lessons</p>
                      <p className="font-semibold text-ink">
                        {report.completedLessons} / {report.totalLessons}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-muted">Quizzes Passed</p>
                      <p className="font-semibold text-ink">
                        {report.passedQuizzes} / {report.totalQuizzes}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-muted">Assignments Approved</p>
                      <p className="font-semibold text-ink">
                        {report.approvedAssignments} / {report.totalAssignments}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-muted">Capstone</p>
                      <p className="font-semibold text-ink">
                        {report.capstoneApproved
                          ? "Approved ✓"
                          : track.requires_capstone
                          ? "Pending Review"
                          : "Not Required"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Upcoming Specializations */}
      {comingSoonTracks.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Planned Certifications
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {comingSoonTracks.map((track) => (
              <div
                key={track.id}
                className="rounded-xl border border-dashed border-border/70 bg-paper/50 p-4 opacity-70"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-ink">{track.title}</h4>
                  <span className="text-[10px] rounded bg-border px-1.5 py-0.5 font-medium text-ink-muted">
                    Coming Soon
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">{track.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
