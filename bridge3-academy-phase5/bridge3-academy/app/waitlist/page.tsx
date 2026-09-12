"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

type TaskStatus = "verified" | "pending_review" | "rejected" | null;

interface StatusResponse {
  id: string;
  emailConfirmed: boolean;
  tasks: {
    telegram: TaskStatus;
    x_twitter: TaskStatus;
  };
  referral: {
    count: number;
    required: number;
    completed: boolean;
  };
  score: number;
}

function StatusPill({ status, completed }: { status: TaskStatus; completed?: boolean }) {
  if (completed) {
    return <span className="rounded bg-accent-tint px-2 py-1 text-xs font-medium text-accent-hover">Completed</span>;
  }
  if (status === "pending_review") {
    return <span className="rounded bg-paper px-2 py-1 text-xs font-medium text-ink-muted border border-border">Pending Review</span>;
  }
  if (status === "verified") {
    return <span className="rounded bg-accent-tint px-2 py-1 text-xs font-medium text-accent-hover">Completed</span>;
  }
  if (status === "rejected") {
    return <span className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700">Not verified — try again</span>;
  }
  return <span className="rounded bg-paper px-2 py-1 text-xs font-medium text-ink-muted border border-border">Not started</span>;
}

function VerificationDashboardInner() {
  const searchParams = useSearchParams();
  const [waitlistId, setWaitlistId] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Resolve the id: prefer the URL, fall back to what was saved at signup.
  useEffect(() => {
    const fromUrl = searchParams.get("id");
    if (fromUrl) {
      localStorage.setItem("b3a_waitlist_id", fromUrl);
      setWaitlistId(fromUrl);
    } else {
      const stored = localStorage.getItem("b3a_waitlist_id");
      setWaitlistId(stored);
    }
  }, [searchParams]);

  const refreshStatus = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/waitlist/status?id=${id}`);
      if (!res.ok) {
        setLoadError("We couldn't find that verification link.");
        setLoading(false);
        return;
      }
      const data: StatusResponse = await res.json();
      setStatusData(data);
      setLoadError("");
    } catch {
      setLoadError("Something went wrong loading your status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (waitlistId) refreshStatus(waitlistId);
    else setLoading(false);
  }, [waitlistId, refreshStatus]);

  if (loading) {
    return <p className="mx-auto max-w-content px-6 py-24 text-ink-muted">Loading your verification status…</p>;
  }

  if (!waitlistId || loadError) {
    return (
      <div className="mx-auto max-w-content px-6 py-24">
        <h1 className="font-display text-2xl text-ink">We couldn&rsquo;t find your verification link</h1>
        <p className="mt-2 text-ink-muted">
          {loadError || "Join the waitlist from the homepage first, then come back here from your confirmation email."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Verification Tasks Dashboard</h1>
      <p className="mt-2 max-w-prose text-ink-muted">
        Your verification score increases as you complete tasks.
      </p>

      <div className="mt-6 max-w-md">
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>Verification score</span>
          <span className="font-semibold text-ink">{statusData?.score ?? 0}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${statusData?.score ?? 0}%` }}
          />
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-6">
        <EmailTask
          waitlistId={waitlistId}
          confirmed={statusData?.emailConfirmed ?? false}
          onResent={() => waitlistId && refreshStatus(waitlistId)}
        />
        <UsernameTask
          title="Join Telegram community"
          usernameLabel="Your Telegram username"
          taskType="telegram"
          waitlistId={waitlistId}
          status={statusData?.tasks.telegram ?? null}
          onSubmitted={() => waitlistId && refreshStatus(waitlistId)}
        />
        <UsernameTask
          title="Follow X (Twitter)"
          usernameLabel="Your X (Twitter) username"
          taskType="x_twitter"
          waitlistId={waitlistId}
          status={statusData?.tasks.x_twitter ?? null}
          onSubmitted={() => waitlistId && refreshStatus(waitlistId)}
        />
        <ReferralTask waitlistId={waitlistId} referral={statusData?.referral ?? { count: 0, required: 3, completed: false }} />
      </div>
    </div>
  );
}

function TaskShell({
  title,
  status,
  completed,
  children,
}: {
  title: string;
  status: TaskStatus;
  completed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded border border-border bg-paper-raised p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-base font-semibold text-ink">{title}</h3>
        <StatusPill status={status} completed={completed} />
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function EmailTask({
  waitlistId,
  confirmed,
  onResent,
}: {
  waitlistId: string;
  confirmed: boolean;
  onResent: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function resend() {
    setSending(true);
    await fetch("/api/waitlist/resend-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: waitlistId }),
    });
    setSending(false);
    setSent(true);
    onResent();
  }

  return (
    <TaskShell title="Confirm email" status={null} completed={confirmed}>
      {confirmed ? (
        <p className="text-sm text-ink-muted">This one&rsquo;s automatic — thanks for confirming.</p>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-sm text-ink-muted">Check your inbox for the confirmation link.</p>
          <button
            type="button"
            onClick={resend}
            disabled={sending}
            className="text-sm font-medium text-accent-hover underline disabled:opacity-60"
          >
            {sending ? "Sending…" : sent ? "Sent again" : "Resend confirmation email"}
          </button>
        </div>
      )}
    </TaskShell>
  );
}

function UsernameTask({
  title,
  usernameLabel,
  taskType,
  waitlistId,
  status,
  onSubmitted,
}: {
  title: string;
  usernameLabel: string;
  taskType: "telegram" | "x_twitter";
  waitlistId: string;
  status: TaskStatus;
  onSubmitted: () => void;
}) {
  const [username, setUsername] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canEdit = status === null || status === "rejected";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username) {
      setError("Enter your username.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      let screenshotPath: string | null = null;

      if (file) {
        const path = `${waitlistId}/${taskType}-${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabaseBrowser.storage
          .from("waitlist-verification")
          .upload(path, file);
        if (uploadError) throw new Error("Could not upload screenshot.");
        screenshotPath = path;
      }

      const res = await fetch("/api/waitlist/submit-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waitlistSignupId: waitlistId,
          taskType,
          submissionText: username,
          screenshotPath,
        }),
      });

      if (!res.ok) throw new Error("Could not save your submission.");

      onSubmitted();
      setUsername("");
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TaskShell title={title} status={status}>
      {canEdit ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder={usernameLabel}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full max-w-sm rounded border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-ink-muted"
          />
          <p className="text-xs text-ink-muted">
            A screenshot is optional but speeds up manual review.
          </p>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting ? "Submitting…" : status === "rejected" ? "Resubmit" : "Submit for review"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-ink-muted">
          {status === "pending_review"
            ? "Submitted — a human reviewer will confirm this shortly."
            : "Verified — thanks!"}
        </p>
      )}
    </TaskShell>
  );
}

function ReferralTask({
  waitlistId,
  referral,
}: {
  waitlistId: string;
  referral: { count: number; required: number; completed: boolean };
}) {
  const [copied, setCopied] = useState(false);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${waitlistId}`
      : "";

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <TaskShell title="Share with 3 friends" status={null} completed={referral.completed}>
      <div className="flex flex-col gap-3">
        <div className="flex max-w-md items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full rounded border border-border bg-paper px-3 py-2 text-xs text-ink-muted"
          />
          <button
            type="button"
            onClick={copyLink}
            className="whitespace-nowrap rounded border border-border px-3 py-2 text-xs font-medium text-ink-soft hover:border-accent"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-sm text-ink-muted">
          {referral.completed
            ? `${referral.count} of ${referral.required} friends have joined using your link — nice work.`
            : `${referral.count} of ${referral.required} friends have joined using your link. This updates automatically the moment a friend signs up and confirms their email — no need to submit anything.`}
        </p>
      </div>
    </TaskShell>
  );
}

export default function WaitlistDashboardPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-content px-6 py-24 text-ink-muted">Loading…</p>}>
      <VerificationDashboardInner />
    </Suspense>
  );
}
