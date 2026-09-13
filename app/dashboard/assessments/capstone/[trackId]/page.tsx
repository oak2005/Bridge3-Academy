"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface CapstoneSubmission {
  id: string;
  file_path: string | null;
  github_link: string | null;
  portfolio_description: string | null;
  status: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  needs_revision: "Needs Revision",
  approved: "Approved",
};

export default function CapstonePage() {
  const params = useParams<{ trackId: string }>();
  const { session } = useProfile();

  const [trackTitle, setTrackTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<CapstoneSubmission[]>([]);

  const [githubLink, setGithubLink] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadSubmissions = useCallback(async () => {
    if (!session) return;
    const { data } = await supabaseBrowser
      .from("capstone_submissions")
      .select("id, file_path, github_link, portfolio_description, status, created_at")
      .eq("track_id", params.trackId)
      .eq("student_id", session.user.id)
      .order("created_at", { ascending: false });
    setSubmissions(data || []);
  }, [session, params.trackId]);

  useEffect(() => {
    (async () => {
      const { data: track } = await supabaseBrowser
        .from("tracks")
        .select("title")
        .eq("id", params.trackId)
        .maybeSingle();
      setTrackTitle(track?.title || "");
      await loadSubmissions();
      setLoading(false);
    })();
  }, [params.trackId, loadSubmissions]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    if (!githubLink && !description && !file) {
      setError("Fill in at least one field before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      let filePath: string | null = null;
      if (file) {
        const path = `${session.user.id}/${params.trackId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabaseBrowser.storage
          .from("capstone-submissions")
          .upload(path, file);
        if (uploadError) throw new Error("Could not upload file.");
        filePath = path;
      }

      const { error: insertError } = await supabaseBrowser.from("capstone_submissions").insert({
        track_id: params.trackId,
        student_id: session.user.id,
        github_link: githubLink || null,
        portfolio_description: description || null,
        file_path: filePath,
        status: "submitted",
      });
      if (insertError) throw new Error("Could not save your submission.");

      setGithubLink("");
      setDescription("");
      setFile(null);
      await loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function downloadFile(path: string) {
    const { data, error } = await supabaseBrowser.storage
      .from("capstone-submissions")
      .createSignedUrl(path, 60);
    if (error || !data) return;
    window.open(data.signedUrl, "_blank");
  }

  if (loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <p className="text-sm text-ink-muted">{trackTitle}</p>
      <h1 className="mt-1 font-display text-2xl text-ink">Capstone Project</h1>
      <p className="mt-2 max-w-prose text-ink-muted">
        Submit your project link, a description for your portfolio, and any
        supporting files.
      </p>

      <div className="mt-8 rounded border border-border bg-paper-raised p-6">
        <h2 className="font-sans text-sm font-semibold text-ink">
          {submissions.length > 0 ? "Submit again" : "Submit your capstone"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="text-sm font-medium text-ink-soft">
            GitHub link
            <input
              type="url"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              placeholder="https://github.com/you/project"
              className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent"
            />
          </label>
          <label className="text-sm font-medium text-ink-soft">
            Portfolio description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what you built and what you learned…"
              className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent"
            />
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-ink-muted"
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit capstone"}
          </button>
        </form>
      </div>

      {submissions.length > 0 && (
        <div className="mt-6 rounded border border-border bg-paper-raised p-6">
          <h2 className="font-sans text-sm font-semibold text-ink">Your submissions</h2>
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {submissions.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  {s.github_link && (
                    <a
                      href={s.github_link}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-accent-hover underline"
                    >
                      {s.github_link}
                    </a>
                  )}
                  {s.portfolio_description && (
                    <p className="mt-1 text-sm text-ink-soft">{s.portfolio_description}</p>
                  )}
                  {s.file_path && (
                    <button
                      type="button"
                      onClick={() => downloadFile(s.file_path!)}
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
    </div>
  );
}
