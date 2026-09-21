"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface LessonInfo {
  id: string;
  title: string;
  duration_minutes: number | null;
  module_title: string;
}

interface TrackProgress {
  track_title: string;
  total_lessons: number;
  completed_lessons: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
}

export default function DashboardPage() {
  const { session, profile, loading: authLoading } = useProfile();
  const [loading, setLoading] = useState(true);
  const [nextLesson, setNextLesson] = useState<LessonInfo | null>(null);
  const [allCaughtUp, setAllCaughtUp] = useState(false);
  const [progress, setProgress] = useState<TrackProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!session?.user?.id) {
      if (!authLoading) setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data: track } = await supabaseBrowser
          .from("tracks")
          .select("id, title")
          .eq("slug", "general-track")
          .maybeSingle();

        if (!track) {
          setLoading(false);
          return;
        }

        const { data: modules } = await supabaseBrowser
          .from("modules")
          .select("id, title, order_index")
          .eq("track_id", track.id)
          .order("order_index", { ascending: true });

        if (!modules || modules.length === 0) {
          setLoading(false);
          return;
        }

        const moduleIds = modules.map((m) => m.id);
        const { data: lessons } = await supabaseBrowser
          .from("lessons")
          .select("id, title, duration_minutes, module_id, order_index")
          .in("module_id", moduleIds)
          .order("order_index", { ascending: true });

        const allLessons = lessons || [];

        const { data: progressRows } = await supabaseBrowser
          .from("student_progress")
          .select("lesson_id")
          .eq("student_id", session.user.id)
          .in(
            "lesson_id",
            allLessons.map((l) => l.id)
          );
        const completedIds = new Set((progressRows || []).map((p) => p.lesson_id));

        setProgress({
          track_title: track.title,
          total_lessons: allLessons.length,
          completed_lessons: completedIds.size,
        });

        // "Today's lesson" = first incomplete lesson in course order
        const modulesById = new Map(modules.map((m) => [m.id, m.title]));
        const next = allLessons.find((l) => !completedIds.has(l.id));

        if (next) {
          setNextLesson({
            id: next.id,
            title: next.title,
            duration_minutes: next.duration_minutes,
            module_title: modulesById.get(next.module_id) || "",
          });
        } else if (allLessons.length > 0) {
          setAllCaughtUp(true);
        }
      } catch (err) {
        console.error("Failed to load dashboard progress:", err);
      } finally {
        setLoading(false);
      }
    })();

    fetch("/api/leaderboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(() => setLeaderboard([]));
  }, [session, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-content px-6 py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-paper-raised" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-paper-raised" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-44 rounded-xl border border-border bg-paper-raised animate-pulse" />
          <div className="h-44 rounded-xl border border-border bg-paper-raised animate-pulse" />
          <div className="h-44 rounded-xl border border-border bg-paper-raised animate-pulse" />
          <div className="h-44 rounded-xl border border-border bg-paper-raised animate-pulse" />
        </div>
      </div>
    );
  }

  const percent =
    progress && progress.total_lessons > 0
      ? Math.round((progress.completed_lessons / progress.total_lessons) * 100)
      : 0;

  const firstName = profile?.full_name?.split(" ")[0] || "Scholar";

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Track your coursework, submit workshop assignments, and advance your Web3 competencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/docs"
            className="rounded-lg border border-border bg-paper-raised px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-accent"
          >
            📖 Docs
          </Link>
          <Link
            href="/dashboard/community"
            className="rounded-lg border border-border bg-paper-raised px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-accent"
          >
            💬 Community
          </Link>
        </div>
      </div>

      {/* Hero Action: Resume Learning */}
      <div className="mt-8 rounded-2xl border border-accent/40 bg-gradient-to-br from-paper-raised to-paper p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                {allCaughtUp ? "Track Completed" : "Resume Coursework"}
              </span>
            </div>

            {nextLesson ? (
              <>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                  {nextLesson.title}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted">
                  Part of <strong>{nextLesson.module_title}</strong> · Est. {nextLesson.duration_minutes ?? "10"} min reading
                </p>
              </>
            ) : allCaughtUp ? (
              <>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                  🎉 You are all caught up in this track!
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted">
                  Head over to the Certification portal to verify your requirements and claim your certificate.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                  Explore Your Learning Path
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted">
                  Choose a track and begin your journey from Bitcoin fundamentals to production smart contracts.
                </p>
              </>
            )}
          </div>

          <div className="shrink-0">
            {nextLesson ? (
              <Link
                href={`/dashboard/classroom/${nextLesson.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-bold text-accent-contrast shadow-sm transition-transform hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
              >
                <span>Continue Lesson</span>
                <span>→</span>
              </Link>
            ) : allCaughtUp ? (
              <Link
                href="/dashboard/certification"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-emerald-500 active:scale-[0.98]"
              >
                <span>Claim Certificate 🎓</span>
              </Link>
            ) : (
              <Link
                href="/dashboard/my-courses"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-bold text-accent-contrast shadow-sm transition-transform hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
              >
                <span>Browse Courses →</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Progress, Quick Launch, Deadlines, Leaderboard */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Track Progress Card */}
        <div className="rounded-xl border border-border bg-paper-raised p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">
              {progress?.track_title || "General Track"}
            </h2>
            <span className="rounded-full bg-accent-tint px-2.5 py-0.5 text-xs font-bold text-accent">
              {percent}% Done
            </span>
          </div>

          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-border/60">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
            <span>
              {progress?.completed_lessons ?? 0} of {progress?.total_lessons ?? 0} lessons completed
            </span>
            <Link
              href="/dashboard/my-courses"
              className="font-semibold text-accent hover:underline"
            >
              View Full Syllabus →
            </Link>
          </div>
        </div>

        {/* Quick Launchpad Shortcuts */}
        <div className="rounded-xl border border-border bg-paper-raised p-6 shadow-sm">
          <h2 className="font-display text-base font-semibold text-ink">
            Quick Launchpad
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/workshops"
              className="flex items-center gap-2.5 rounded-lg border border-border bg-paper p-3 text-xs font-semibold text-ink transition-colors hover:border-accent hover:bg-paper-hover"
            >
              <span className="text-base">🛠️</span>
              <span>Workshops</span>
            </Link>
            <Link
              href="/dashboard/assessments"
              className="flex items-center gap-2.5 rounded-lg border border-border bg-paper p-3 text-xs font-semibold text-ink transition-colors hover:border-accent hover:bg-paper-hover"
            >
              <span className="text-base">📝</span>
              <span>Quizzes</span>
            </Link>
            <Link
              href="/dashboard/portfolio"
              className="flex items-center gap-2.5 rounded-lg border border-border bg-paper p-3 text-xs font-semibold text-ink transition-colors hover:border-accent hover:bg-paper-hover"
            >
              <span className="text-base">🏅</span>
              <span>Portfolio</span>
            </Link>
            <Link
              href="/dashboard/certification"
              className="flex items-center gap-2.5 rounded-lg border border-border bg-paper p-3 text-xs font-semibold text-ink transition-colors hover:border-accent hover:bg-paper-hover"
            >
              <span className="text-base">🎓</span>
              <span>Certificates</span>
            </Link>
          </div>
        </div>

        {/* Community Updates & Deadlines */}
        <div className="rounded-xl border border-border bg-paper-raised p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">
              Upcoming Deadlines
            </h2>
            <span className="text-[11px] text-ink-muted">Module Milestones</span>
          </div>

          <ul className="mt-4 space-y-3">
            <li className="flex items-center justify-between rounded-lg border border-border/70 bg-paper p-3 text-xs">
              <div>
                <p className="font-medium text-ink">General Track Module 1 Quiz</p>
                <p className="text-[11px] text-ink-muted">Bitcoin consensus &amp; cryptography</p>
              </div>
              <span className="shrink-0 font-semibold text-amber-600 dark:text-amber-400">
                Self-paced
              </span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-border/70 bg-paper p-3 text-xs">
              <div>
                <p className="font-medium text-ink">Workshop Project 1</p>
                <p className="text-[11px] text-ink-muted">Wallet setup &amp; public key derivation</p>
              </div>
              <span className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">
                Open for submission
              </span>
            </li>
          </ul>
        </div>

        {/* Top Scholars Leaderboard */}
        <div className="rounded-xl border border-border bg-paper-raised p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">
              Academy Leaderboard
            </h2>
            <Link
              href="/dashboard/portfolio"
              className="text-xs font-semibold text-accent hover:underline"
            >
              My XP &amp; Badges →
            </Link>
          </div>

          {leaderboard.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-xs text-ink-muted">
              Loading rankings… Complete lessons to earn your first XP!
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {leaderboard.slice(0, 4).map((student, idx) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-paper px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        idx === 0
                          ? "bg-amber-100 text-amber-800"
                          : idx === 1
                          ? "bg-slate-200 text-slate-700"
                          : idx === 2
                          ? "bg-amber-700/20 text-amber-900"
                          : "bg-paper-raised text-ink-muted"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-medium text-ink">{student.name}</span>
                  </div>
                  <span className="font-mono font-bold text-accent">
                    {student.xp} XP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
