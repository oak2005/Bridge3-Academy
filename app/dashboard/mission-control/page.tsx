"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface Stats {
  users: {
    total: number;
    students: number;
    mentors: number;
    admins: number;
    deactivated: number;
    activeLast30Days: number;
  };
  learning: {
    totalLessons: number;
    totalCompletions: number;
    lessonCompletionRate: number;
  };
  mentorActivity: { reviewsCompleted: number; pendingReview: number };
  waitlist: { total: number; confirmed: number };
}

function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded border border-border bg-paper-raised p-5">
      <p className="font-display text-2xl text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export default function MissionControlPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileLoading) return;
    if (profile && profile.role !== "admin") {
      // Sent to the ordinary dashboard — no message, no hint that this
      // route exists at all.
      router.replace("/dashboard");
    }
  }, [profile, profileLoading, router]);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    (async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) setStats(await res.json());
      setLoading(false);
    })();
  }, [profile]);

  if (profileLoading || loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading…</p>;
  }
  if (!profile || profile.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Mission Control</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/mission-control/users"
            className="rounded border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:border-accent"
          >
            Manage users
          </Link>
          <Link
            href="/dashboard/mission-control/content"
            className="rounded border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:border-accent"
          >
            Content
          </Link>
          <Link
            href="/dashboard/mission-control/waitlist"
            className="rounded border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:border-accent"
          >
            Waitlist Review
          </Link>
          <Link
            href="/dashboard/mission-control/audit-log"
            className="rounded border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:border-accent"
          >
            Audit Log
          </Link>
        </div>
      </div>

      {!stats ? (
        <p className="mt-6 text-ink-muted">Could not load stats.</p>
      ) : (
        <>
          <h2 className="mt-8 font-display text-lg text-ink">People</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total accounts" value={stats.users.total} />
            <StatCard
              label="Active in last 30 days"
              value={stats.users.activeLast30Days}
              hint="Completed a lesson, quiz, or submission"
            />
            <StatCard label="Deactivated" value={stats.users.deactivated} />
            <StatCard label="Students" value={stats.users.students} />
            <StatCard label="Mentors" value={stats.users.mentors} />
            <StatCard label="Admins" value={stats.users.admins} />
          </div>

          <h2 className="mt-10 font-display text-lg text-ink">Learning</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <StatCard label="Lessons published" value={stats.learning.totalLessons} />
            <StatCard label="Lessons completed (all students)" value={stats.learning.totalCompletions} />
            <StatCard
              label="Completion rate"
              value={`${stats.learning.lessonCompletionRate}%`}
              hint="Completions ÷ (lessons × students)"
            />
          </div>

          <h2 className="mt-10 font-display text-lg text-ink">Mentor activity</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <StatCard label="Reviews completed" value={stats.mentorActivity.reviewsCompleted} />
            <StatCard label="Waiting for review" value={stats.mentorActivity.pendingReview} />
          </div>

          <h2 className="mt-10 font-display text-lg text-ink">Waitlist</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <StatCard label="Total signups" value={stats.waitlist.total} />
            <StatCard label="Email confirmed" value={stats.waitlist.confirmed} />
          </div>
        </>
      )}
    </div>
  );
}
