"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PublicWaitlistTask, DEFAULT_TASKS } from "@/lib/waitlist/tasks";
import { WaitlistLeaderboard } from "@/components/waitlist/WaitlistLeaderboard";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/settings/constants";
import { WaitlistTour } from "@/components/waitlist/WaitlistTour";

type TaskStatus = "verified" | "pending_review" | "rejected" | null;

interface StatusResponse {
  id: string;
  emailConfirmed: boolean;
  tasks: Record<string, TaskStatus>;
  referral: {
    count: number;
    required: number;
    completed: boolean;
    code?: string;
    earnedXP?: number;
    maxXP?: number;
    invitees?: { id: string; maskedEmail: string; confirmed: boolean; createdAt: string }[];
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
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tourForcedOpen, setTourForcedOpen] = useState(false);

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

  // Load dynamic verification tasks and site settings
  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch(`/api/waitlist/tasks?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.tasks && data.tasks.length > 0) {
            const sorted = [...data.tasks].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            setTasks(sorted);
          }
        }
      } catch (e) {
        console.error("Could not fetch waitlist tasks, using defaults", e);
      }
    }
    async function loadSettings() {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) setSiteSettings(data.settings);
        }
      } catch (e) {
        console.error("Could not fetch site settings", e);
      }
    }
    loadTasks();
    loadSettings();
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
        <div className="mt-8 text-left">
          <WaitlistLeaderboard />
        </div>
      </div>
    );
  }

  const score = statusData?.score ?? 0;

  return (
    <div className="mx-auto max-w-content px-6 py-12 md:py-16">
      {/* Header section with enhanced badge */}
      <div
        data-tour="waitlist-header"
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border"
      >
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            Early Scholar Access
          </span>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl text-ink">Verification Tasks Dashboard</h1>
          <p className="mt-2 max-w-prose text-sm text-ink-muted">
            Your verification score increases priority onboarding, scholarship consideration, and private cohort placement.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href="/demo"
              target="_blank"
              rel="noopener noreferrer"
              data-tour="waitlist-video-btn"
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
            >
              <span>▶ Watch Step-by-Step Video Tutorial</span>
              <span>&rarr;</span>
            </a>
            <button
              type="button"
              onClick={() => setTourForcedOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors shadow-sm"
              title="Launch guided interactive walkthrough"
            >
              <span>🧭 Interactive Walkthrough</span>
              <span className="text-[10px]">💡</span>
            </button>
          </div>
        </div>

        {/* Score Card */}
        <div
          data-tour="waitlist-progress"
          className="min-w-[240px] rounded-xl border border-border bg-paper-raised p-4 shadow-sm"
        >
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

      {searchParams.get("confirmed") === "true" && (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 flex items-center gap-3 animate-fade-in shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-base">
            ✓
          </span>
          <div>
            <p className="text-sm font-semibold">Email Successfully Verified!</p>
            <p className="text-xs text-emerald-400/80">Your priority ranking has been boosted. Complete the tasks below to maximize your scholar score.</p>
          </div>
        </div>
      )}

      {/* Verified Scholar State: If registration is closed, show secured priority status (NO login/signup). If opened, show registration action */}
      {score >= 100 && !siteSettings.registrationOpen && (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast font-bold text-base">
              ✓
            </span>
            <div>
              <h2 className="text-base font-display font-semibold text-ink">Waitlist Verification Complete!</h2>
              <p className="mt-1 text-xs text-ink-soft leading-relaxed max-w-xl">
                Your verification tasks have been verified and your early scholar priority is secured. Student account registration has not officially opened yet.
              </p>
              <div className="mt-3.5 inline-flex items-center gap-2 rounded-full border border-border bg-paper px-3.5 py-1 text-xs text-ink-muted">
                <span>🔒 Registration opening soon — we will email you when cohort enrollment officially launches!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {score >= 100 && siteSettings.registrationOpen && (
        <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-base">
                ✓
              </span>
              <div>
                <h2 className="text-base font-display font-semibold text-ink">Verification Complete — Registration is Now Open!</h2>
                <p className="mt-1 text-xs text-ink-soft leading-relaxed max-w-xl">
                  As a verified waitlist scholar, you have earned early access. You can now create your Bridge3 Academy account or sign in to start your Web3 learning journey.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
              <Link
                href="/signup"
                className="rounded-lg bg-accent px-5 py-2.5 text-xs font-semibold text-accent-contrast hover:bg-accent-hover transition-colors shadow-sm"
              >
                Create Account / Sign In →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Task List Suite */}
      <div className="mt-8 flex flex-col gap-5">
        {tasks.map((task, idx) => {
          const isOfficialTourTarget = task.id === "x_twitter" || (idx === 1 && task.id !== "confirm_email" && task.id !== "referral");

          if (task.id === "confirm_email") {
            return (
              <div key={task.id} data-tour="waitlist-email">
                <EmailTask
                  task={task}
                  waitlistId={waitlistId}
                  confirmed={statusData?.emailConfirmed ?? false}
                  onResent={() => refreshStatus(waitlistId)}
                />
              </div>
            );
          }

          if (task.id === "referral") {
            return (
              <div key={task.id} data-tour="waitlist-referral">
                <ReferralTask
                  task={task}
                  waitlistId={waitlistId}
                  referral={statusData?.referral ?? { count: 0, required: 3, completed: false }}
                />
              </div>
            );
          }

          const card = (
            <DynamicTaskCard
              task={task}
              waitlistId={waitlistId}
              status={statusData?.tasks[task.id] ?? null}
              onSubmitted={() => refreshStatus(waitlistId)}
            />
          );

          if (isOfficialTourTarget) {
            return (
              <div key={task.id} data-tour="official-channel-task">
                {card}
              </div>
            );
          }

          return <div key={task.id}>{card}</div>;
        })}
      </div>

      {/* Top Inviters Leaderboard */}
      <WaitlistLeaderboard waitlistId={waitlistId} />

      {/* Interactive Walkthrough Tour */}
      <WaitlistTour forceOpen={tourForcedOpen} onClose={() => setTourForcedOpen(false)} />
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
          <a
            href="/api/waitlist/confirm-email?token=demo"
            id="verify-email-btn"
            className="inline-flex items-center gap-1 rounded bg-accent px-3 py-1.5 text-xs font-semibold text-accent-contrast transition-colors hover:bg-accent-hover shadow-sm"
          >
            Verify Email Address →
          </a>
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
  referral: StatusResponse["referral"];
}) {
  const [copied, setCopied] = useState(false);
  const refParam = referral.code || waitlistId;
  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${refParam}`
      : `https://bridge3-academy.vercel.app/?ref=${refParam}`;

  function copyLink() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const shareText = encodeURIComponent(
    "Join Bridge3 Academy to learn Web3, Clarity smart contracts on Bitcoin, and earn blockchain certifications! " +
      referralLink
  );

  return (
    <TaskShell
      title={task.title}
      description={task.description}
      status={null}
      completed={referral.completed}
      points={task.weight}
    >
      <div className="flex flex-col gap-4">
        {/* Status & XP Callout */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-accent/10 border border-accent/20 p-3">
          <div className="text-xs">
            <span className="font-semibold text-ink">
              {referral.count} of {referral.required} verified referral{referral.count === 1 ? "" : "s"}
            </span>
            <span className="ml-2 text-ink-muted">
              ({referral.completed ? "✓ Task Completed" : "Task in progress"})
            </span>
          </div>
          <div className="text-xs font-semibold text-accent">
            Earned: {referral.earnedXP ?? referral.count * 10} XP / {referral.maxXP || 500} Max XP
          </div>
        </div>

        {/* Invite link input */}
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

        {/* 1-Click Social Share Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-ink-muted font-medium">Share directly:</span>
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <span>💬</span> WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-paper px-3 py-1 text-xs font-semibold text-ink-soft hover:bg-paper-raised hover:text-ink transition-colors"
          >
            <span>𝕏</span> Post on X
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join Bridge3 Academy to learn Web3 on Bitcoin!")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 hover:bg-sky-500/20 transition-colors"
          >
            <span>✈️</span> Telegram
          </a>
        </div>

        {/* Invited Scholars List */}
        {referral.invitees && referral.invitees.length > 0 && (
          <div className="mt-2 rounded-lg border border-border bg-paper p-3">
            <p className="text-xs font-semibold text-ink-muted mb-2">
              Your Invited Scholars ({referral.invitees.length})
            </p>
            <ul className="flex flex-col divide-y divide-border">
              {referral.invitees.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="font-mono text-ink-soft">{inv.maskedEmail}</span>
                  <span
                    className={
                      inv.confirmed
                        ? "text-emerald-400 font-medium"
                        : "text-amber-500 font-medium"
                    }
                  >
                    {inv.confirmed ? "✓ Verified (+20 XP)" : "○ Awaiting confirmation"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
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
