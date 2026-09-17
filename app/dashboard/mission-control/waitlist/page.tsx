"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface Submission {
  id: string;
  email: string;
  taskType: string;
  submissionText: string | null;
  screenshotUrl: string | null;
  createdAt: string;
}

const TASK_LABEL: Record<string, string> = {
  telegram: "Telegram",
  x_twitter: "X (Twitter)",
};

export default function WaitlistReviewPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (profileLoading) return;
    if (profile && profile.role !== "admin") router.replace("/dashboard");
  }, [profile, profileLoading, router]);

  const loadSubmissions = useCallback(async () => {
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;
    const res = await fetch("/api/admin/waitlist-review", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data.submissions || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    loadSubmissions();
  }, [profile, loadSubmissions]);

  async function review(submissionId: string, status: "verified" | "rejected") {
    setBusyId(submissionId);
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const res = await fetch("/api/admin/waitlist-review", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ submissionId, status }),
    });

    if (res.ok) {
      // Remove it from the list immediately — it's no longer pending.
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    }
    setBusyId(null);
  }

  if (profileLoading || loading) return <p className="px-6 py-12 text-ink-muted">Loading…</p>;
  if (!profile || profile.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <Link href="/dashboard/mission-control" className="text-sm text-accent-hover underline">
        ← Mission Control
      </Link>
      <h1 className="mt-2 font-display text-2xl text-ink">Waitlist Verification Review</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {submissions.length} pending — Telegram/X submissions only (email confirms itself
        automatically, and referrals count themselves from real signups).
      </p>

      {submissions.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">Nothing waiting for review.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {submissions.map((s) => (
            <div key={s.id} className="rounded border border-border bg-paper-raised p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">
                  {s.email} — {TASK_LABEL[s.taskType] || s.taskType}
                </p>
                <p className="text-xs text-ink-muted">
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
              {s.submissionText && (
                <p className="mt-2 text-sm text-ink-soft">Username: {s.submissionText}</p>
              )}
              {s.screenshotUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.screenshotUrl}
                  alt="Submitted screenshot"
                  className="mt-3 max-h-64 rounded border border-border object-contain"
                />
              )}
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  disabled={busyId === s.id}
                  onClick={() => review(s.id, "verified")}
                  className="rounded bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-60"
                >
                  Verify
                </button>
                <button
                  type="button"
                  disabled={busyId === s.id}
                  onClick={() => review(s.id, "rejected")}
                  className="rounded border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:border-accent disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
