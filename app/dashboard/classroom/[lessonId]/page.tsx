"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";
import { VideoPlayer } from "@/components/classroom/VideoPlayer";

interface LessonDetail {
  id: string;
  title: string;
  instructor_name: string | null;
  notes: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  module_id: string;
  module_title: string;
  track_title: string;
}

interface SiblingLesson {
  id: string;
  title: string;
  order_index: number;
}

interface Resource {
  id: string;
  file_name: string;
  storage_path: string;
}

export default function ClassroomPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params.lessonId;
  const { session } = useProfile();

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [siblings, setSiblings] = useState<SiblingLesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [resources, setResources] = useState<Resource[]>([]);
  const [marking, setMarking] = useState(false);

  const loadCompletion = useCallback(
    async (moduleId: string) => {
      if (!session) return;
      const { data: siblingLessons } = await supabaseBrowser
        .from("lessons")
        .select("id")
        .eq("module_id", moduleId);
      const ids = (siblingLessons || []).map((l) => l.id);
      if (ids.length === 0) return;
      const { data: progress } = await supabaseBrowser
        .from("student_progress")
        .select("lesson_id")
        .eq("student_id", session.user.id)
        .in("lesson_id", ids);
      setCompletedIds(new Set((progress || []).map((p) => p.lesson_id)));
    },
    [session]
  );

  useEffect(() => {
    if (!lessonId) return;

    (async () => {
      setLoading(true);

      const { data: lessonRow } = await supabaseBrowser
        .from("lessons")
        .select("id, title, instructor_name, notes, video_url, duration_minutes, module_id")
        .eq("id", lessonId)
        .maybeSingle();

      if (!lessonRow) {
        setLesson(null);
        setLoading(false);
        return;
      }

      const { data: moduleRow } = await supabaseBrowser
        .from("modules")
        .select("id, title, track_id")
        .eq("id", lessonRow.module_id)
        .maybeSingle();

      const { data: trackRow } = moduleRow
        ? await supabaseBrowser.from("tracks").select("title").eq("id", moduleRow.track_id).maybeSingle()
        : { data: null };

      setLesson({
        id: lessonRow.id,
        title: lessonRow.title,
        instructor_name: lessonRow.instructor_name,
        notes: lessonRow.notes,
        video_url: lessonRow.video_url,
        duration_minutes: lessonRow.duration_minutes,
        module_id: lessonRow.module_id,
        module_title: moduleRow?.title || "",
        track_title: trackRow?.title || "",
      });

      const { data: siblingLessons } = await supabaseBrowser
        .from("lessons")
        .select("id, title, order_index")
        .eq("module_id", lessonRow.module_id)
        .order("order_index", { ascending: true });
      setSiblings(siblingLessons || []);

      const { data: resourceRows } = await supabaseBrowser
        .from("lesson_resources")
        .select("id, file_name, storage_path")
        .eq("lesson_id", lessonId);
      setResources(resourceRows || []);

      await loadCompletion(lessonRow.module_id);
      setLoading(false);
    })();
  }, [lessonId, loadCompletion]);

  async function toggleComplete() {
    if (!session || !lesson) return;
    setMarking(true);
    const isDone = completedIds.has(lesson.id);

    if (isDone) {
      await supabaseBrowser
        .from("student_progress")
        .delete()
        .eq("student_id", session.user.id)
        .eq("lesson_id", lesson.id);
    } else {
      await supabaseBrowser
        .from("student_progress")
        .insert({ student_id: session.user.id, lesson_id: lesson.id });
    }
    await loadCompletion(lesson.module_id);
    setMarking(false);
  }

  async function downloadResource(path: string, fileName: string) {
    const { data, error } = await supabaseBrowser.storage
      .from("lesson-resources")
      .createSignedUrl(path, 60);
    if (error || !data) return;
    const link = document.createElement("a");
    link.href = data.signedUrl;
    link.download = fileName;
    link.click();
  }

  if (loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading lesson…</p>;
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-content px-6 py-12">
        <p className="text-ink-muted">Lesson not found.</p>
        <Link href="/dashboard/my-courses" className="mt-2 inline-block text-sm text-accent-hover underline">
          Back to My Courses
        </Link>
      </div>
    );
  }

  const isDone = completedIds.has(lesson.id);

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <p className="text-sm text-ink-muted">
        {lesson.track_title} · {lesson.module_title}
      </p>
      <h1 className="mt-1 font-display text-2xl text-ink">{lesson.title}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <VideoPlayer videoUrl={lesson.video_url} />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              {lesson.instructor_name ? `Instructor: ${lesson.instructor_name}` : "Instructor: Bridge3 Academy"}
              {lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ""}
            </p>
            <button
              type="button"
              onClick={toggleComplete}
              disabled={marking}
              className={`rounded px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                isDone
                  ? "border border-border text-ink-soft hover:border-accent"
                  : "bg-accent text-accent-contrast hover:bg-accent-hover"
              }`}
            >
              {marking ? "Saving…" : isDone ? "Mark as incomplete" : "Mark as completed"}
            </button>
          </div>

          <div className="mt-6 rounded border border-border bg-paper-raised p-6">
            <h2 className="font-sans text-sm font-semibold text-ink">Lesson notes</h2>
            <p className="mt-2 text-sm text-ink-soft">
              {lesson.notes || "No written notes for this lesson yet."}
            </p>
          </div>

          <div className="mt-6 rounded border border-border bg-paper-raised p-6">
            <h2 className="font-sans text-sm font-semibold text-ink">Downloadable resources</h2>
            {resources.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">No resources attached to this lesson yet.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {resources.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => downloadResource(r.storage_path, r.file_name)}
                      className="text-sm text-accent-hover underline"
                    >
                      {r.file_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="rounded border border-border bg-paper-raised p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {lesson.module_title}
          </p>
          <ul className="flex flex-col gap-1">
            {siblings.map((s) => {
              const active = s.id === lesson.id;
              const done = completedIds.has(s.id);
              return (
                <li key={s.id}>
                  <Link
                    href={`/dashboard/classroom/${s.id}`}
                    className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${
                      active ? "bg-accent-tint text-ink" : "text-ink-soft hover:bg-paper"
                    }`}
                  >
                    <span className={done ? "text-accent-hover" : "text-ink-muted"}>
                      {done ? "✓" : "○"}
                    </span>
                    {s.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
