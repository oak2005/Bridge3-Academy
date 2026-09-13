"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

interface LessonInfo {
  id: string;
  title: string;
  duration_minutes: number | null;
  module_title: string;
  track_title: string;
}

interface TrackProgress {
  track_title: string;
  total_lessons: number;
}

// Placeholder — no real activity/points system exists yet (that's Phase 9).
const LEADERBOARD_PLACEHOLDER = [
  { name: "Amara O.", points: 420 },
  { name: "Tunde A.", points: 385 },
  { name: "Ngozi E.", points: 340 },
];

// Placeholder — no assignment/deadline model exists yet (Phase 7 & 8).
const DEADLINES_PLACEHOLDER = [
  { label: "Complete Level 1 assessment", due: "In 5 days" },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [todaysLesson, setTodaysLesson] = useState<LessonInfo | null>(null);
  const [progress, setProgress] = useState<TrackProgress | null>(null);

  useEffect(() => {
    (async () => {
      // "Today's lesson" and the progress bar are both based on the
      // General Track, since every student starts there. Real per-student
      // completion tracking arrives in Phase 6 — until then this correctly
      // shows 0% complete, since nobody has actually completed anything yet.
      const { data: track } = await supabaseBrowser
        .from("tracks")
        .select("id, title")
        .eq("slug", "general-track")
        .maybeSingle();

      if (track) {
        const { data: modules } = await supabaseBrowser
          .from("modules")
          .select("id, title, order_index")
          .eq("track_id", track.id)
          .order("order_index", { ascending: true });

        if (modules && modules.length > 0) {
          const moduleIds = modules.map((m) => m.id);
          const { count } = await supabaseBrowser
            .from("lessons")
            .select("id", { count: "exact", head: true })
            .in("module_id", moduleIds);

          setProgress({ track_title: track.title, total_lessons: count || 0 });

          const firstModule = modules[0];
          const { data: firstLesson } = await supabaseBrowser
            .from("lessons")
            .select("id, title, duration_minutes")
            .eq("module_id", firstModule.id)
            .order("order_index", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (firstLesson) {
            setTodaysLesson({
              id: firstLesson.id,
              title: firstLesson.title,
              duration_minutes: firstLesson.duration_minutes,
              module_title: firstModule.title,
              track_title: track.title,
            });
          }
        }
      }

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading your dashboard…</p>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded border border-border bg-paper-raised p-6">
          <h2 className="font-sans text-sm font-semibold text-ink">
            {progress?.track_title || "General Track"} — 0% completed
          </h2>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full bg-accent" style={{ width: "0%" }} />
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            0 of {progress?.total_lessons ?? "…"} lessons completed. Real progress
            tracking begins once lesson pages are built.
          </p>
        </div>

        <div className="rounded border border-border bg-paper-raised p-6">
          <h2 className="font-sans text-sm font-semibold text-ink">Today&rsquo;s lesson</h2>
          {todaysLesson ? (
            <>
              <p className="mt-3 font-display text-lg text-ink">{todaysLesson.title}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {todaysLesson.module_title} · {todaysLesson.duration_minutes ?? "—"} min
              </p>
              <Link
                href="/dashboard/my-courses"
                className="mt-4 inline-block rounded bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
              >
                Start lesson
              </Link>
              <p className="mt-2 text-xs text-ink-muted">
                (Lesson pages are built in Phase 6 — this links to My Courses for now.)
              </p>
            </>
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
          <h2 className="font-sans text-sm font-semibold text-ink">Top students this week</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {LEADERBOARD_PLACEHOLDER.map((s, i) => (
              <li key={s.name} className="flex justify-between text-sm text-ink-soft">
                <span>
                  {i + 1}. {s.name}
                </span>
                <span className="text-ink-muted">{s.points} XP</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-muted">
            Sample data — real XP and rankings arrive with Portfolio (Phase 9).
          </p>
        </div>
      </div>
    </div>
  );
}
