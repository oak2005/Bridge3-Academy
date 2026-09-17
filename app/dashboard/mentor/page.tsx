"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface QueueItem {
  type: "assignment" | "capstone";
  submissionId: string;
  title: string;
  studentId: string;
  studentName: string;
  status: string;
  createdAt: string;
  preview: string;
}

interface QuizOverviewRow {
  studentId: string;
  name: string;
  quizzesPassed: number;
  totalQuizzes: number;
  totalAttempts: number;
}

export default function MentorDashboardPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [quizOverview, setQuizOverview] = useState<QuizOverviewRow[]>([]);
  const [error, setError] = useState("");

  // Client-side check for a good user experience — the real enforcement
  // is inside each API route (lib/auth/verifyMentor.ts), which rejects
  // non-mentors even if this redirect were somehow skipped entirely.
  useEffect(() => {
    if (profileLoading) return;
    if (profile && profile.role !== "mentor" && profile.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [profile, profileLoading, router]);

  useEffect(() => {
    if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) return;

    (async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [queueRes, quizRes] = await Promise.all([
        fetch("/api/mentor/queue", { headers, cache: "no-store" }),
        fetch("/api/mentor/quiz-overview", { headers, cache: "no-store" }),
      ]);

      if (!queueRes.ok || !quizRes.ok) {
        setError("Could not load mentor data.");
        setLoading(false);
        return;
      }

      const queueData = await queueRes.json();
      const quizData = await quizRes.json();
      setQueue(queueData.queue || []);
      setQuizOverview(quizData.overview || []);
      setLoading(false);
    })();
  }, [profile]);

  if (profileLoading || loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading mentor dashboard…</p>;
  }

  if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) {
    return null; // redirecting
  }

  if (error) {
    return <p className="px-6 py-12 text-red-700">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <h1 className="font-display text-2xl text-ink">Mentor Dashboard</h1>

      <h2 className="mt-8 font-display text-xl text-ink">
        Pending Review ({queue.length})
      </h2>
      {queue.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">Nothing waiting for review right now.</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border border-y border-border">
          {queue.map((item) => (
            <li key={`${item.type}-${item.submissionId}`}>
              <Link
                href={`/dashboard/mentor/review/${item.type}/${item.submissionId}`}
                className="flex items-center justify-between gap-4 py-4 hover:bg-paper-raised"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {item.title}{" "}
                    <span className="text-xs text-ink-muted">
                      ({item.type === "assignment" ? "Assignment" : "Capstone"})
                    </span>
                  </p>
                  <p className="text-xs text-ink-muted">
                    {item.studentName} · {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  {item.preview && (
                    <p className="mt-1 max-w-lg truncate text-xs text-ink-soft">{item.preview}</p>
                  )}
                </div>
                <span className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs text-ink-soft">
                  {item.status === "submitted" ? "Submitted" : "Under Review"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 font-display text-xl text-ink">Quiz Results Overview</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Informational only — quizzes are graded automatically, nothing here needs action.
      </p>
      {quizOverview.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No students yet.</p>
      ) : (
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-muted">
              <th className="py-2 font-medium">Student</th>
              <th className="py-2 font-medium">Quizzes Passed</th>
              <th className="py-2 font-medium">Attempts Made</th>
            </tr>
          </thead>
          <tbody>
            {quizOverview.map((row) => (
              <tr key={row.studentId} className="border-b border-border">
                <td className="py-2 text-ink">{row.name}</td>
                <td className="py-2 text-ink-soft">
                  {row.quizzesPassed} / {row.totalQuizzes}
                </td>
                <td className="py-2 text-ink-soft">{row.totalAttempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
