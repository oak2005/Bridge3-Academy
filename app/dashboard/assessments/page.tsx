"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface QuizRow {
  moduleId: string;
  moduleTitle: string;
  trackTitle: string;
  quizTitle: string;
  bestPassed: boolean | null; // null = not attempted
}

interface CapstoneRow {
  trackId: string;
  trackTitle: string;
  status: string | null; // null = not submitted
}

export default function AssessmentsPage() {
  const { session } = useProfile();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [capstones, setCapstones] = useState<CapstoneRow[]>([]);

  useEffect(() => {
    if (!session) return;

    (async () => {
      const { data: quizRows } = await supabaseBrowser
        .from("quizzes")
        .select("id, module_id, title");

      const { data: moduleRows } = await supabaseBrowser
        .from("modules")
        .select("id, title, track_id");

      const { data: trackRows } = await supabaseBrowser
        .from("tracks")
        .select("id, title, requires_capstone");

      const { data: attempts } = await supabaseBrowser
        .from("quiz_attempts")
        .select("quiz_id, passed")
        .eq("student_id", session.user.id);

      const moduleById = new Map((moduleRows || []).map((m) => [m.id, m]));
      const trackById = new Map((trackRows || []).map((t) => [t.id, t]));

      const passedByQuiz = new Map<string, boolean>();
      for (const a of attempts || []) {
        if (a.passed) passedByQuiz.set(a.quiz_id, true);
        else if (!passedByQuiz.has(a.quiz_id)) passedByQuiz.set(a.quiz_id, false);
      }

      const assembledQuizzes: QuizRow[] = (quizRows || []).map((q) => {
        const mod = moduleById.get(q.module_id);
        const track = mod ? trackById.get(mod.track_id) : undefined;
        return {
          moduleId: q.module_id,
          moduleTitle: mod?.title || "",
          trackTitle: track?.title || "",
          quizTitle: q.title,
          bestPassed: passedByQuiz.has(q.id) ? passedByQuiz.get(q.id)! : null,
        };
      });

      const { data: capstoneSubs } = await supabaseBrowser
        .from("capstone_submissions")
        .select("track_id, status, created_at")
        .eq("student_id", session.user.id)
        .order("created_at", { ascending: false });

      const statusByTrack = new Map<string, string>();
      for (const c of capstoneSubs || []) {
        if (!statusByTrack.has(c.track_id)) statusByTrack.set(c.track_id, c.status);
      }

      const assembledCapstones: CapstoneRow[] = (trackRows || [])
        .filter((t) => t.requires_capstone)
        .map((t) => ({
          trackId: t.id,
          trackTitle: t.title,
          status: statusByTrack.get(t.id) || null,
        }));

      setQuizzes(assembledQuizzes);
      setCapstones(assembledCapstones);
      setLoading(false);
    })();
  }, [session]);

  if (loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading assessments…</p>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <h1 className="font-display text-2xl text-ink">Assessments</h1>

      <h2 className="mt-8 font-display text-xl text-ink">Quizzes</h2>
      {quizzes.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No quizzes published yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border border-y border-border">
          {quizzes.map((q) => (
            <li key={q.moduleId}>
              <Link
                href={`/dashboard/assessments/quiz/${q.moduleId}`}
                className="flex items-center justify-between py-4 hover:bg-paper-raised"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{q.quizTitle}</p>
                  <p className="text-xs text-ink-muted">
                    {q.trackTitle} · {q.moduleTitle}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    q.bestPassed === true
                      ? "border-accent text-accent-hover"
                      : q.bestPassed === false
                      ? "border-red-200 text-red-700"
                      : "border-border text-ink-muted"
                  }`}
                >
                  {q.bestPassed === true ? "Passed" : q.bestPassed === false ? "Not passed yet" : "Not attempted"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 font-display text-xl text-ink">Capstone Projects</h2>
      {capstones.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No capstone required yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border border-y border-border">
          {capstones.map((c) => (
            <li key={c.trackId}>
              <Link
                href={`/dashboard/assessments/capstone/${c.trackId}`}
                className="flex items-center justify-between py-4 hover:bg-paper-raised"
              >
                <p className="text-sm font-medium text-ink">{c.trackTitle} — Capstone</p>
                <span className="rounded-full border border-border px-3 py-1 text-xs text-ink-soft">
                  {c.status ? c.status.replace("_", " ") : "Not submitted"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
