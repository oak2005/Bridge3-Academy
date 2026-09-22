"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PublicWaitlistTask, DEFAULT_TASKS } from "@/lib/waitlist/tasks";

type TaskStatus = "verified" | "pending_review" | "rejected" | null;

interface StatusResponse {
  id: string;
  emailConfirmed: boolean;
  tasks: Record<string, TaskStatus>;
  referral: {
    count: number;
    required: number;
    completed: boolean;
  };
  score: number;
}

function StatusPill({ status, completed }: { status: TaskStatus; completed?: boolean }) {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Completed
      </span>
    );
  }
  if (status === "pending_review") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Pending Review
      </span>
    );
  }
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Completed
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400">
        Not verified — try again
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-paper px-2.5 py-0.5 text-xs font-medium text-ink-muted">
      Not started
    </span>
  );
}

function VerificationDashboardInner() {
  const searchParams = useSearchParams();
  const [waitlistId, setWaitlistId] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [tasks, setTasks] = useState<PublicWaitlistTask[]>(DEFAULT_TASKS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Resolve and sanitize the id: handle accidental whitespace or corrupted hyphens from URLs
  useEffect(() => {
    const fromUrl = searchParams.get("id");
    if (fromUrl) {
      const sanitized = fromUrl.trim().replace(/\s+/g, "-");
      localStorage.setItem("b3a_waitlist_id", sanitized);
      setWaitlistId(sanitized);
    } else {
      const stored = localStorage.getItem("b3a_waitlist_id");
      setWaitlistId(stored ? stored.trim().replace(/\s+/g, "-") : null);
    }
  }, [searchParams]);

  // Load dynamic verification tasks
  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch("/api/waitlist/tasks");
        if (res.ok) {
          const data = await res.json();
          if (data.tasks && data.tasks.length > 0) {
            setTasks(data.tasks);
          }
        }
      } catch (e) {
        console.error("Could not fetch waitlist tasks, using defaults", e);
      }
    }
    loadTasks();
  }, []);

  const refreshStatus = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/waitlist/status?id=${encodeURIComponent(id)}`);
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

  if (loading && !statusData) {
    return (
      <div className="mx-auto max-w-content px-6 py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="mt-4 text-sm text-ink-muted">Loading your verification status…</p>
      </div>
    );
  }

  if (!waitlistId || loadError) {
    return (
      <div className="mx-auto max-w-content px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Verification Link Not Found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
          {loadError || "Join the waitlist from the homepage first, then check your confirmation email for your private verification link."}
        </p>
        <a
          href="/#waitlist"
          className="mt-6 inline-block rounded bg-accent px-6 py-2.5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
        >
          Join Waitlist
        </a>
      </div>
    );
  }

  const score = statusData?.score ?? 0;

  return (
    <div className="mx-auto max-w-content px-6 py-12 md:py-16">
      {/* Header section with enhanced badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            Early Scholar Access
          </span>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl text-ink">Verification Tasks Dashboard</h1>
          <p className="mt-2 max-w-prose text-sm text-ink-muted">
            Your verification score increases priority onboarding, scholarship consideration, and private cohort placement.
          </p>
        </div>

        {/* Score Card */}
        <div className="min-w-[240px] rounded-xl border border-border bg-paper-raised p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
            <span>Verification Progress</span>
            <span className="text-base font-bold text-accent">{score}%</span>
          </div>
          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-paper border border-border/60">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500 rounded-full"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-ink-muted text-right">
            {score === 100 ? "🎉 All tasks verified!" : "Complete remaining tasks below"}
          </p>
        </div>
      </div>

      {/* Task List Suite */}
      <div className="mt-8 flex flex-col gap-5">
        {tasks.map((task) => {
          if (task.id === "confirm_email") {
            return (
              <EmailTask
                key={task.id}
                task={task}
                waitlistId={waitlistId}
                confirmed={statusData?.emailConfirmed ?? false}
                onResent={() => refreshStatus(waitlistId)}
              />
            );
          }

          if (task.id === "referral") {
            return (
              <ReferralTask
                key={task.id}
                task={task}
                waitlistId={waitlistId}
                referral={statusData?.referral ?? { count: 0, required: 3, completed: false }}
              />
            );
          }

          return (
            <DynamicTaskCard
              key={task.id}
              task={task}
              waitlistId={waitlistId}
              status={statusData?.tasks[task.id] ?? null}
              onSubmitted={() => refreshStatus(waitlistId)}
            />
          );
        })}
      </div>
    </div>
  );
}

function TaskShell({
  title,
  description,
  status,
  completed,
  points,
  children,
}: {
  title: string;
  description: string;
  status: TaskStatus;
  completed?: boolean;
  points?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-paper-raised p-6 shadow-sm transition-all hover:border-border/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-sans text-base font-semibold text-ink">{title}</h3>
            {points ? (
              <span className="rounded bg-paper px-2 py-0.5 text-[10px] font-bold text-ink-muted border border-border">
                +{points}%
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-ink-muted">{description}</p>
        </div>
        <div className="self-start sm:self-auto">
          <StatusPill status={status} completed={completed} />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border/50">{children}</div>
    </div>
  );
}

function EmailTask({
  task,
  waitlistId,
  confirmed,
  onResent,
}: {
  task: PublicWaitlistTask;
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
    <TaskShell
      title={task.title}
      description={task.description}
      status={null}
      completed={confirmed}
      points={task.weight}
    >
      {confirmed ? (
        <p className="text-xs text-emerald-400 font-medium">✓ Email address verified. Your account priority is recorded.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-ink-muted">Please check your inbox or spam folder for your confirmation link.</p>
          <button
            type="button"
            onClick={resend}
            disabled={sending}
            className="text-xs font-semibold text-accent hover:underline disabled:opacity-60"
          >
            {sending ? "Sending…" : sent ? "✓ Sent again" : "Resend confirmation email"}
          </button>
        </div>
      )}
    </TaskShell>
  );
}

function ReferralTask({
  task,
  waitlistId,
  referral,
}: {
  task: PublicWaitlistTask;
  waitlistId: string;
  referral: { count: number; required: number; completed: boolean };
}) {
  const [copied, setCopied] = useState(false);
  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${waitlistId}`
      : `https://bridge3-academy.vercel.app/?ref=${waitlistId}`;

  function copyLink() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <TaskShell
      title={task.title}
      description={task.description}
      status={null}
      completed={referral.completed}
      points={task.weight}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-ink-soft">
          <span>Verified Scholar Referrals</span>
          <span className="font-semibold text-ink">
            {referral.count} of {referral.required} verified
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 rounded-lg border border-border bg-paper px-3 py-2 text-xs font-mono text-ink select-all focus:outline-none"
          />
          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast hover:bg-accent-hover transition-colors"
          >
            {copied ? "✓ Copied!" : "Copy Invite Link"}
          </button>
        </div>
      </div>
    </TaskShell>
  );
}

function DynamicTaskCard({
  task,
  waitlistId,
  status,
  onSubmitted,
}: {
  task: PublicWaitlistTask;
  waitlistId: string;
  status: TaskStatus;
  onSubmitted: () => void;
}) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isDone = status === "verified" || status === "pending_review";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() && task.inputType !== "none") {
      setError("Please provide your username or proof link.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist/submit-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waitlistSignupId: waitlistId,
          taskType: task.id,
          submissionText: value.trim() || "Completed",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not submit task.");
      } else {
        setValue("");
        onSubmitted();
      }
    } catch {
      setError("Failed to submit. Check connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TaskShell
      title={task.title}
      description={task.description}
      status={status}
      completed={status === "verified"}
      points={task.weight}
    >
      <div className="flex flex-col gap-3">
        {task.actionUrl && (
          <div>
            <a
              href={task.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              {task.actionLabel || `Open ${task.title}`} →
            </a>
          </div>
        )}

        {isDone ? (
          <p className="text-xs text-ink-muted">
            {status === "verified"
              ? "✓ Verified by Academy staff."
              : "✓ Submitted — our team will verify your submission shortly."}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2">
            {task.inputType !== "none" && (
              <input
                type="text"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={task.inputPlaceholder || "Enter username or link"}
                className="flex-1 rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit for Verification"}
            </button>
          </form>
        )}

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>
    </TaskShell>
  );
}

export default function VerificationDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-content px-6 py-24 text-center">
          <p className="text-sm text-ink-muted">Loading verification tasks…</p>
        </div>
      }
    >
      <VerificationDashboardInner />
    </Suspense>
  );
}
