"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface SubmissionDetail {
  studentName: string;
  title: string;
  submissionText: string | null;
  githubLink: string | null;
  portfolioDescription: string | null;
  filePath: string | null;
  status: string;
}

export default function MentorReviewPage() {
  const params = useParams<{ type: string; submissionId: string }>();
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState<"approved" | "needs_revision" | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const type = params.type as "assignment" | "capstone";

  useEffect(() => {
    if (profileLoading) return;
    if (profile && profile.role !== "mentor" && profile.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [profile, profileLoading, router]);

  useEffect(() => {
    if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) return;

    (async () => {
      // Uses direct table reads via the browser client — but note the
      // mentor's own profile.role doesn't grant them any extra RLS access
      // here. This works because a mentor can still only read what RLS
      // already allows (nothing extra) — the actual submission content on
      // this page is fetched through the queue data already loaded, kept
      // minimal. For a full detail view we re-fetch via the same secure
      // queue route filtered to this one submission.
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/mentor/queue", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        setError("Could not load this submission.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      const match = (data.queue || []).find(
        (q: { type: string; submissionId: string }) =>
          q.type === type && q.submissionId === params.submissionId
      );

      if (!match) {
        // Not in the pending queue (already reviewed, or doesn't exist).
        setError("This submission isn't pending review (it may have already been handled).");
        setLoading(false);
        return;
      }

      setDetail({
        studentName: match.studentName,
        title: match.title,
        submissionText: type === "assignment" ? match.preview : null,
        githubLink: null,
        portfolioDescription: type === "capstone" ? match.preview : null,
        filePath: null,
        status: match.status,
      });
      setLoading(false);
    })();
  }, [profile, type, params.submissionId]);

  async function submitReview(status: "approved" | "needs_revision") {
    setSaving(status);
    setError("");

    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError("You need to be signed in.");
      setSaving(null);
      return;
    }

    const res = await fetch("/api/mentor/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type,
        submissionId: params.submissionId,
        status,
        feedback,
      }),
    });

    if (!res.ok) {
      setError("Could not save your review. Try again.");
      setSaving(null);
      return;
    }

    setDone(true);
    setSaving(null);
  }

  if (profileLoading || loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading submission…</p>;
  }

  if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) {
    return null;
  }

  if (done) {
    return (
      <div className="mx-auto max-w-content px-6 py-16 text-center">
        <h1 className="font-display text-2xl text-ink">Review saved</h1>
        <p className="mt-2 text-ink-muted">The student will see your feedback right away.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/mentor")}
          className="mt-6 rounded bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
        >
          Back to Mentor Dashboard
        </button>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-content px-6 py-16">
        <p className="text-ink-muted">{error || "Submission not found."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <p className="text-sm text-ink-muted">{detail.studentName}</p>
      <h1 className="mt-1 font-display text-2xl text-ink">{detail.title}</h1>

      <div className="mt-6 rounded border border-border bg-paper-raised p-6">
        <h2 className="font-sans text-sm font-semibold text-ink">Submission</h2>
        {detail.submissionText && (
          <p className="mt-2 text-sm text-ink-soft">{detail.submissionText}</p>
        )}
        {detail.portfolioDescription && (
          <p className="mt-2 text-sm text-ink-soft">{detail.portfolioDescription}</p>
        )}
        {!detail.submissionText && !detail.portfolioDescription && (
          <p className="mt-2 text-sm text-ink-muted">No text content — check for an attached file.</p>
        )}
      </div>

      <div className="mt-6 rounded border border-border bg-paper-raised p-6">
        <h2 className="font-sans text-sm font-semibold text-ink">Your feedback</h2>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder="Write feedback the student will see…"
          className="mt-3 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent"
        />

        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => submitReview("approved")}
            disabled={saving !== null}
            className="rounded bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-60"
          >
            {saving === "approved" ? "Saving…" : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => submitReview("needs_revision")}
            disabled={saving !== null}
            className="rounded border border-border px-5 py-2 text-sm font-medium text-ink-soft hover:border-accent disabled:opacity-60"
          >
            {saving === "needs_revision" ? "Saving…" : "Needs Revision"}
          </button>
        </div>
      </div>
    </div>
  );
}
