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

// Placeholder — no assignment/deadline model exists yet (Phase 7 & 8).
const DEADLINES_PLACEHOLDER = [
  { label: "Complete Level 1 assessment", due: "In 5 days" },
];

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
}

export default function DashboardPage() {
  const { session } = useProfile();
  const [loading, setLoading] = useState(true);
  const [nextLesson, setNextLesson] = useState<LessonInfo | null>(null);
  const [allCaughtUp, setAllCaughtUp] = useState(false);
  const [progress, setProgress] = useState<TrackProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!session) return;

    (async () => {
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

      // "Today's lesson" = the first lesson (in course order) the student
      // hasn't completed yet. If everything's done, say so honestly.
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

      setLoading(false);
    })();

    fetch("/api/leaderboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(() => setLeaderboard([]));
  }, [session]);

  if (loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading your dashboard…</p>;
  }

  const percent = progress && progress.total_lessons > 0
    ? Math.round((progress.completed_lessons / progress.total_lessons) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded border border-border bg-paper-raised p-6">
          <h2 className="font-sans text-sm font-semibold text-ink">
            {progress?.track_title || "General Track"} — {percent}% completed
          </h2>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full bg-accent transition-all" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            {progress?.completed_lessons ?? 0} of {progress?.total_lessons ?? "…"} lessons completed.
          </p>
        </div>

        <div className="rounded border border-border bg-paper-raised p-6">
          <h2 className="font-sans text-sm font-semibold text-ink">Today&rsquo;s lesson</h2>
          {nextLesson ? (
            <>
              <p className="mt-3 font-display text-lg text-ink">{nextLesson.title}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {nextLesson.module_title} · {nextLesson.duration_minutes ?? "—"} min
              </p>
              <Link
                href={`/dashboard/classroom/${nextLesson.id}`}
                className="mt-4 inline-block rounded bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
              >
                Start lesson
              </Link>
            </>
          ) : allCaughtUp ? (
            <p className="mt-3 text-sm text-ink-soft">
              You&rsquo;ve completed every lesson in the General Track. 🎉
            </p>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">No lessons found yet.</p>
          )}
        </div>

        <div className="rounded border border-border bg-paper-raised p-6">
          <h2 className="font-sans text-sm font-semibold text-ink">Upcoming deadlines</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {DEADLINES_PLACEHOLDER.map((d) => (
              <li key={d.label} className="flex justify-between text-sm text-ink-soft">
                <span>{d.label}</span>
                <span className="text-ink-muted">{d.due}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-muted">
            Sample data — real deadlines arrive with Assessments (Phase 8).
          </p>
        </div>

        <div className="rounded border border-border bg-paper-raised p-6">
          <h2 className="font-sans text-sm font-semibold text-ink">Top students</h2>
          {leaderboard.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              No XP earned yet across the platform — be the first!
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {leaderboard.map((s, i) => (
                <li key={s.id} className="flex justify-between text-sm text-ink-soft">
                  <span>
                    {i + 1}. {s.name}
                  </span>
                  <span className="text-ink-muted">{s.xp} XP</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/portfolio"
            className="mt-3 inline-block text-xs text-accent-hover underline"
          >
            View your own XP and badges
          </Link>
        </div>
      </div>
    </div>
  );
}
