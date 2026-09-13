"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface AssignmentDetail {
  id: string;
  title: string;
  description: string | null;
  submission_format: string | null;
  module_title: string;
  track_title: string;
}

interface Submission {
  id: string;
  submission_text: string | null;
  file_path: string | null;
  status: string;
  created_at: string;
}

interface Comment {
  id: string;
  student_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  needs_revision: "Needs Revision",
  approved: "Approved",
};

export default function AssignmentPage() {
  const params = useParams<{ assignmentId: string }>();
  const assignmentId = params.assignmentId;
  const { session, profile } = useProfile();

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [submissionText, setSubmissionText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const loadSubmissions = useCallback(async () => {
    if (!session || !assignmentId) return;
    const { data } = await supabaseBrowser
      .from("assignment_submissions")
      .select("id, submission_text, file_path, status, created_at")
      .eq("assignment_id", assignmentId)
      .eq("student_id", session.user.id)
      .order("created_at", { ascending: false });
    setSubmissions(data || []);
  }, [session, assignmentId]);

  const loadComments = useCallback(async () => {
    if (!assignmentId) return;
    const { data } = await supabaseBrowser
      .from("assignment_comments")
      .select("id, student_id, body, created_at")
      .eq("assignment_id", assignmentId)
      .order("created_at", { ascending: true });

    if (!data || data.length === 0) {
      setComments([]);
      return;
    }

    const studentIds = Array.from(new Set(data.map((c) => c.student_id)));
    const { data: authors } = await supabaseBrowser
      .from("profiles")
      .select("id, full_name")
      .in("id", studentIds);
    const nameById = new Map((authors || []).map((a) => [a.id, a.full_name]));

    setComments(
      data.map((c) => ({
        ...c,
        author_name: nameById.get(c.student_id) || "Student",
      }))
    );
  }, [assignmentId]);

  useEffect(() => {
    if (!assignmentId) return;

    (async () => {
      setLoading(true);

      const { data: assignmentRow } = await supabaseBrowser
        .from("assignments")
        .select("id, title, description, submission_format, module_id")
        .eq("id", assignmentId)
        .maybeSingle();

      if (!assignmentRow) {
        setAssignment(null);
        setLoading(false);
        return;
      }

      const { data: moduleRow } = await supabaseBrowser
        .from("modules")
        .select("id, title, track_id")
        .eq("id", assignmentRow.module_id)
        .maybeSingle();

      const { data: trackRow } = moduleRow
        ? await supabaseBrowser.from("tracks").select("title").eq("id", moduleRow.track_id).maybeSingle()
        : { data: null };

      setAssignment({
        id: assignmentRow.id,
        title: assignmentRow.title,
        description: assignmentRow.description,
        submission_format: assignmentRow.submission_format,
        module_title: moduleRow?.title || "",
        track_title: trackRow?.title || "",
      });

      await loadSubmissions();
      await loadComments();
      setLoading(false);
    })();
  }, [assignmentId, loadSubmissions, loadComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !assignment) return;
    if (!submissionText && !file) {
      setSubmitError("Write something or attach a file before submitting.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    try {
      let filePath: string | null = null;
      if (file) {
        const path = `${session.user.id}/${assignment.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabaseBrowser.storage
          .from("assignment-submissions")
          .upload(path, file);
        if (uploadError) throw new Error("Could not upload file.");
        filePath = path;
      }

      const { error: insertError } = await supabaseBrowser.from("assignment_submissions").insert({
        assignment_id: assignment.id,
        student_id: session.user.id,
        submission_text: submissionText || null,
        file_path: filePath,
        status: "submitted",
      });
      if (insertError) throw new Error("Could not save your submission.");

      setSubmissionText("");
      setFile(null);
      await loadSubmissions();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function downloadSubmissionFile(path: string) {
    const { data, error } = await supabaseBrowser.storage
      .from("assignment-submissions")
      .createSignedUrl(path, 60);
    if (error || !data) return;
    window.open(data.signedUrl, "_blank");
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !commentText.trim()) return;
    setPostingComment(true);
    await supabaseBrowser.from("assignment_comments").insert({
      assignment_id: assignmentId,
      student_id: session.user.id,
      body: commentText.trim(),
    });
    setCommentText("");
    await loadComments();
    setPostingComment(false);
  }

  if (loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading assignment…</p>;
  }

  if (!assignment) {
    return (
      <div className="mx-auto max-w-content px-6 py-12">
        <p className="text-ink-muted">Assignment not found.</p>
        <Link href="/dashboard/workshops" className="mt-2 inline-block text-sm text-accent-hover underline">
          Back to Workshops
        </Link>
      </div>
    );
  }

  const latest = submissions[0];

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <p className="text-sm text-ink-muted">
        {assignment.track_title} · {assignment.module_title}
      </p>
      <h1 className="mt-1 font-display text-2xl text-ink">{assignment.title}</h1>
      {assignment.description && (
        <p className="mt-3 max-w-prose text-ink-soft">{assignment.description}</p>
      )}
      {assignment.submission_format && (
        <p className="mt-2 max-w-prose text-sm text-ink-muted">
          <span className="font-medium text-ink-soft">Submission format: </span>
          {assignment.submission_format}
        </p>
      )}

      {/* Submission form */}
      <div className="mt-8 rounded border border-border bg-paper-raised p-6">
        <h2 className="font-sans text-sm font-semibold text-ink">
          {latest ? "Submit again" : "Submit your work"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            rows={4}
            placeholder="Write your submission, or paste a link to your work…"
            className="w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-ink-muted"
          />
          {submitError && <p className="text-sm text-red-700">{submitError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit assignment"}
          </button>
        </form>
      </div>

      {/* Submission history */}
      {submissions.length > 0 && (
        <div className="mt-6 rounded border border-border bg-paper-raised p-6">
          <h2 className="font-sans text-sm font-semibold text-ink">Your submissions</h2>
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {submissions.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  {s.submission_text && (
                    <p className="text-sm text-ink-soft">{s.submission_text}</p>
                  )}
                  {s.file_path && (
                    <button
                      type="button"
                      onClick={() => downloadSubmissionFile(s.file_path!)}
                      className="mt-1 text-sm text-accent-hover underline"
                    >
                      View attached file
                    </button>
                  )}
                  <p className="mt-1 text-xs text-ink-muted">
                    {new Date(s.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs text-ink-soft">
                  {STATUS_LABEL[s.status] || s.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Peer discussion */}
      <div className="mt-6 rounded border border-border bg-paper-raised p-6">
        <h2 className="font-sans text-sm font-semibold text-ink">Peer discussion</h2>

        {comments.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            No comments yet — be the first to share a thought or ask a question.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-4">
            {comments.map((c) => (
              <li key={c.id}>
                <p className="text-sm font-medium text-ink">
                  {c.student_id === profile?.id ? "You" : c.author_name}
                </p>
                <p className="text-sm text-ink-soft">{c.body}</p>
                <p className="text-xs text-ink-muted">{new Date(c.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handlePostComment} className="mt-4 flex flex-col gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            placeholder="Share a thought or ask a question…"
            className="w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent"
          />
          <button
            type="submit"
            disabled={postingComment || !commentText.trim()}
            className="w-fit rounded border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:border-accent disabled:opacity-60"
          >
            {postingComment ? "Posting…" : "Post comment"}
          </button>
        </form>
      </div>
    </div>
  );
}
