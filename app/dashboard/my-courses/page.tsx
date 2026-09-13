"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number | null;
  order_index: number;
}

interface ModuleWithLessons {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface TrackWithModules {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  track_type: "general" | "ecosystem_support" | "skill_set";
  coming_soon: boolean;
  modules: ModuleWithLessons[];
}

const TYPE_LABELS: Record<TrackWithModules["track_type"], string> = {
  general: "General Track",
  ecosystem_support: "Ecosystem Support Track",
  skill_set: "Skill Set Track",
};

export default function MyCoursesPage() {
  const { session } = useProfile();
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<TrackWithModules[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data: trackRows } = await supabaseBrowser
        .from("tracks")
        .select("id, slug, title, description, track_type, coming_soon, order_index")
        .order("order_index", { ascending: true });

      const { data: moduleRows } = await supabaseBrowser
        .from("modules")
        .select("id, track_id, title, order_index")
        .order("order_index", { ascending: true });

      const { data: lessonRows } = await supabaseBrowser
        .from("lessons")
        .select("id, module_id, title, duration_minutes, order_index")
        .order("order_index", { ascending: true });

      if (session) {
        const { data: progressRows } = await supabaseBrowser
          .from("student_progress")
          .select("lesson_id")
          .eq("student_id", session.user.id);
        setCompletedLessonIds(new Set((progressRows || []).map((r) => r.lesson_id)));
      }

      const assembled: TrackWithModules[] = (trackRows || []).map((track) => ({
        ...track,
        modules: (moduleRows || [])
          .filter((m) => m.track_id === track.id)
          .map((mod) => ({
            ...mod,
            lessons: (lessonRows || []).filter((l) => l.module_id === mod.id),
          })),
      }));

      setTracks(assembled);
      setLoading(false);
    })();
  }, [session]);

  if (loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading courses…</p>;
  }

  const grouped: Record<string, TrackWithModules[]> = {};
  for (const track of tracks) {
    grouped[track.track_type] = grouped[track.track_type] || [];
    grouped[track.track_type].push(track);
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <h1 className="font-display text-2xl text-ink">My Courses</h1>

      <div className="mt-8 flex flex-col gap-12">
        {(Object.keys(TYPE_LABELS) as TrackWithModules["track_type"][]).map((type) => {
          const tracksOfType = grouped[type];
          if (!tracksOfType || tracksOfType.length === 0) return null;

          return (
            <div key={type}>
              <h2 className="font-display text-xl text-ink">{TYPE_LABELS[type]}</h2>
              <div className="mt-4 flex flex-col gap-6">
                {tracksOfType.map((track) => (
                  <div key={track.id} className="rounded border border-border bg-paper-raised p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-sans text-base font-semibold text-ink">{track.title}</h3>
                      {track.coming_soon && (
                        <span className="rounded-full border border-border px-3 py-1 text-xs text-ink-muted">
                          Coming soon
                        </span>
                      )}
                    </div>
                    {track.description && (
                      <p className="mt-1 text-sm text-ink-muted">{track.description}</p>
                    )}

                    {track.modules.length === 0 ? (
                      <p className="mt-4 text-sm text-ink-muted">
                        Content for this track is being finalized.
                      </p>
                    ) : (
                      <div className="mt-4 flex flex-col gap-4">
                        {track.modules.map((mod) => (
                          <div key={mod.id}>
                            <p className="text-sm font-medium text-ink-soft">{mod.title}</p>
                            <ul className="mt-2 flex flex-col divide-y divide-border border-y border-border">
                              {mod.lessons.map((lesson) => {
                                const done = completedLessonIds.has(lesson.id);
                                return (
                                  <li key={lesson.id}>
                                    <Link
                                      href={`/dashboard/classroom/${lesson.id}`}
                                      className="flex items-center justify-between py-3 text-sm text-ink hover:bg-paper"
                                    >
                                      <span className="flex items-center gap-2">
                                        <span
                                          className={
                                            done
                                              ? "text-accent-hover"
                                              : "text-ink-muted"
                                          }
                                        >
                                          {done ? "✓" : "○"}
                                        </span>
                                        {lesson.title}
                                      </span>
                                      <span className="text-ink-muted">
                                        {lesson.duration_minutes ?? "—"} min
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
