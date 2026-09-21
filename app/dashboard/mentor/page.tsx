"use client";

import { useEffect, useState, useMemo } from "react";
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

  // Filter & Search states
  const [filterType, setFilterType] = useState<"all" | "assignment" | "capstone">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (profileLoading) return;
    if (profile && profile.role !== "mentor" && profile.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [profile, profileLoading, router]);

  useEffect(() => {
    if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) return;

    (async () => {
      try {
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
      } catch {
        setError("Network error loading mentor data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [profile]);

  // Optimized filtered queue
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const matchesType = filterType === "all" || item.type === filterType;
      const cleanSearch = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !cleanSearch ||
        item.studentName.toLowerCase().includes(cleanSearch) ||
        item.title.toLowerCase().includes(cleanSearch);
      return matchesType && matchesSearch;
    });
  }, [queue, filterType, searchQuery]);

  const assignmentsCount = queue.filter((i) => i.type === "assignment").length;
  const capstonesCount = queue.filter((i) => i.type === "capstone").length;

  if (profileLoading || loading) {
    return (
      <div className="mx-auto max-w-content px-6 py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-paper-raised" />
        <div className="mt-4 h-4 w-72 animate-pulse rounded bg-paper-raised" />
        <div className="mt-8 space-y-3">
          <div className="h-20 w-full animate-pulse rounded-xl border border-border bg-paper-raised" />
          <div className="h-20 w-full animate-pulse rounded-xl border border-border bg-paper-raised" />
        </div>
      </div>
    );
  }

  if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) {
    return null;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-ink">Mentor Dashboard</h1>
        <p className="mt-1 text-xs sm:text-sm text-ink-muted">
          Review student project submissions, grade workshop deliverables, and guide scholars to graduation.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          ✕ {error}
        </div>
      )}

      {/* Review Queue Section */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-ink">
              Pending Submissions
            </h2>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-contrast">
              {queue.length}
            </span>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterType === "all"
                  ? "bg-accent text-accent-contrast"
                  : "border border-border bg-paper text-ink-muted hover:bg-paper-hover"
              }`}
            >
              All ({queue.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("assignment")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterType === "assignment"
                  ? "bg-accent text-accent-contrast"
                  : "border border-border bg-paper text-ink-muted hover:bg-paper-hover"
              }`}
            >
              Workshops ({assignmentsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("capstone")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterType === "capstone"
                  ? "bg-accent text-accent-contrast"
                  : "border border-border bg-paper text-ink-muted hover:bg-paper-hover"
              }`}
            >
              Capstones ({capstonesCount})
            </button>
          </div>
        </div>

        {/* Search Filter Bar */}
        {queue.length > 0 && (
          <div className="mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by student name or assignment title..."
              className="w-full sm:max-w-md rounded-lg border border-border bg-paper px-3.5 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
          </div>
        )}

        {/* Queue Items */}
        {queue.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-paper-raised p-8 text-center">
            <span className="text-2xl">🎉</span>
            <p className="mt-2 text-sm font-semibold text-ink">All caught up!</p>
            <p className="mt-1 text-xs text-ink-muted">
              No workshop submissions or capstones are pending review right now.
            </p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-paper-raised p-8 text-center">
            <p className="text-xs text-ink-muted">
              No submissions match &ldquo;{searchQuery}&rdquo; in this tab.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
              }}
              className="mt-2 text-xs font-semibold text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-paper-raised shadow-sm overflow-hidden">
            {filteredQueue.map((item) => (
              <Link
                key={`${item.type}-${item.submissionId}`}
                href={`/dashboard/mentor/review/${item.type}/${item.submissionId}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-colors hover:bg-paper-hover"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        item.type === "capstone"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-accent-tint text-accent"
                      }`}
                    >
                      {item.type === "assignment" ? "Workshop" : "Capstone"}
                    </span>
                    <span className="text-xs font-bold text-ink">{item.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    Submitted by <strong>{item.studentName}</strong> ·{" "}
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {item.preview && (
                    <p className="mt-1 line-clamp-1 text-xs text-ink-soft italic">
                      &ldquo;{item.preview}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="rounded-full border border-border bg-paper px-2.5 py-1 text-[11px] font-medium text-ink-muted">
                    {item.status === "submitted" ? "Pending Grade" : "Needs Review"}
                  </span>
                  <span className="text-xs font-bold text-accent">Review →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Results Overview */}
      <div className="mt-12">
        <h2 className="font-display text-lg font-semibold text-ink">
          Automated Quiz Activity
        </h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          Informational summary — module quizzes are server-graded automatically with 80% passing thresholds.
        </p>

        {quizOverview.length === 0 ? (
          <p className="mt-3 text-xs text-ink-muted">No quiz activity recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-paper-raised shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-paper font-semibold text-ink">
                <tr>
                  <th className="p-3">Scholar Name</th>
                  <th className="p-3">Quizzes Passed</th>
                  <th className="p-3">Total Attempts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {quizOverview.map((row) => (
                  <tr key={row.studentId} className="hover:bg-paper-hover">
                    <td className="p-3 font-medium text-ink">{row.name}</td>
                    <td className="p-3 text-ink-soft">
                      {row.quizzesPassed} / {row.totalQuizzes}
                    </td>
                    <td className="p-3 text-ink-soft">{row.totalAttempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
