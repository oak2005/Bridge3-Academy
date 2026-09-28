"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface StepConfig {
  id: number;
  time: string;
  title: string;
  narration: string;
  cursor: { x: number; y: number; clicking?: boolean; visible?: boolean };
}

const STEPS: StepConfig[] = [
  {
    id: 0,
    time: "0:00",
    title: "1. Access Early Access Waitlist",
    narration: "Start on the Bridge3 Academy homepage. Notice the clean, streamlined interface designed for African Web3 scholars.",
    cursor: { x: 50, y: 35, visible: true },
  },
  {
    id: 1,
    time: "0:08",
    title: "2. Enter Scholar Email",
    narration: "Type your email address into the waitlist field to reserve your placement in the upcoming cohort.",
    cursor: { x: 26, y: 56, clicking: true, visible: true },
  },
  {
    id: 2,
    time: "0:16",
    title: "3. Submit Application",
    narration: "Click 'Join Early Access' to generate your private scholar identity and verification token.",
    cursor: { x: 42, y: 56, clicking: true, visible: true },
  },
  {
    id: 3,
    time: "0:24",
    title: "4. Confirmation & Onboarding Checklist",
    narration: "A confirmation dialog outlines the tasks required to boost your onboarding priority ranking.",
    cursor: { x: 50, y: 68, clicking: false, visible: true },
  },
  {
    id: 4,
    time: "0:32",
    title: "5. Open Tasks Dashboard",
    narration: "Click 'Go to Verification Tasks Dashboard' to access your private progress scoring page.",
    cursor: { x: 50, y: 74, clicking: true, visible: true },
  },
  {
    id: 5,
    time: "0:40",
    title: "6. Verification Progress & Telegram Task",
    narration: "Submit your Telegram username to connect with fellow scholars and earn your first +25% progress.",
    cursor: { x: 54, y: 52, clicking: true, visible: true },
  },
  {
    id: 6,
    time: "0:48",
    title: "7. Follow X (Twitter) Task",
    narration: "Submit your X handle to verify social presence and claim another +25% progress score.",
    cursor: { x: 54, y: 70, clicking: true, visible: true },
  },
  {
    id: 7,
    time: "0:56",
    title: "8. Scholar Referral Invite Link",
    narration: "Copy your unique scholar referral link to invite fellow builders and boost placement priority.",
    cursor: { x: 74, y: 88, clicking: true, visible: true },
  },
  {
    id: 8,
    time: "1:04",
    title: "9. Verify Scholar Email",
    narration: "Click the email confirmation link to authenticate your account and elevate your scholarship ranking.",
    cursor: { x: 62, y: 38, clicking: true, visible: true },
  },
  {
    id: 9,
    time: "1:12",
    title: "10. Verified Priority Scholar Status",
    narration: "Your email is confirmed and priority ranking is boosted! You are now fully verified for early access.",
    cursor: { x: 80, y: 22, clicking: false, visible: false },
  },
];

export function WaitlistVideoTutorial({
  initialStep = 0,
  autoPlay = true,
}: {
  initialStep?: number;
  autoPlay?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [isAudioSubtitlesOn, setIsAudioSubtitlesOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulated live fields in the tutorial
  const [typedEmail, setTypedEmail] = useState("");
  const [isSubmittingHero, setIsSubmittingHero] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inDashboard, setInDashboard] = useState(false);
  const [score, setScore] = useState(0);
  const [telegramStatus, setTelegramStatus] = useState<"not_started" | "completed">("not_started");
  const [telegramInput, setTelegramInput] = useState("");
  const [twitterStatus, setTwitterStatus] = useState<"not_started" | "completed">("not_started");
  const [twitterInput, setTwitterInput] = useState("");
  const [referralCopied, setReferralCopied] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const currentStep = STEPS[currentStepIndex];

  // Sync state with step index
  const applyStepState = useCallback((stepIdx: number) => {
    if (stepIdx === 0) {
      setInDashboard(false);
      setShowModal(false);
      setTypedEmail("");
      setIsSubmittingHero(false);
      setScore(0);
      setTelegramStatus("not_started");
      setTwitterStatus("not_started");
      setEmailConfirmed(false);
      setReferralCopied(false);
    } else if (stepIdx === 1) {
      setInDashboard(false);
      setShowModal(false);
      setTypedEmail("scholar.alex@bridge3.org");
      setIsSubmittingHero(false);
    } else if (stepIdx === 2) {
      setInDashboard(false);
      setTypedEmail("scholar.alex@bridge3.org");
      setIsSubmittingHero(true);
      setShowModal(false);
    } else if (stepIdx === 3) {
      setInDashboard(false);
      setIsSubmittingHero(false);
      setShowModal(true);
    } else if (stepIdx === 4) {
      setInDashboard(false);
      setShowModal(true);
    } else if (stepIdx === 5) {
      setInDashboard(true);
      setShowModal(false);
      setTelegramInput("@alex_web3");
      setTelegramStatus("completed");
      setTwitterStatus("not_started");
      setTwitterInput("");
      setScore(25);
      setEmailConfirmed(false);
      setReferralCopied(false);
    } else if (stepIdx === 6) {
      setInDashboard(true);
      setShowModal(false);
      setTelegramStatus("completed");
      setTelegramInput("@alex_web3");
      setTwitterInput("@alex_builder");
      setTwitterStatus("completed");
      setScore(50);
      setEmailConfirmed(false);
      setReferralCopied(false);
    } else if (stepIdx === 7) {
      setInDashboard(true);
      setShowModal(false);
      setTelegramStatus("completed");
      setTwitterStatus("completed");
      setReferralCopied(true);
      setScore(50);
      setEmailConfirmed(false);
    } else if (stepIdx === 8) {
      setInDashboard(true);
      setShowModal(false);
      setTelegramStatus("completed");
      setTwitterStatus("completed");
      setEmailConfirmed(true);
      setScore(75);
    } else if (stepIdx === 9) {
      setInDashboard(true);
      setShowModal(false);
      setTelegramStatus("completed");
      setTwitterStatus("completed");
      setEmailConfirmed(true);
      setReferralCopied(true);
      setScore(75);
    }
  }, []);

  useEffect(() => {
    applyStepState(initialStep);
  }, [initialStep, applyStepState]);

  // Step advancement timer
  useEffect(() => {
    if (!isPlaying) return;

    const durations = [
      4000, // 0: intro
      3500, // 1: type email
      2500, // 2: click submit
      3500, // 3: modal view
      3000, // 4: click dashboard
      4500, // 5: telegram
      4500, // 6: twitter
      3500, // 7: referral
      4000, // 8: verify email
      6000, // 9: final wrap-up
    ];

    const currentDuration = durations[currentStepIndex] / playbackSpeed;

    const timer = setTimeout(() => {
      if (currentStepIndex < STEPS.length - 1) {
        const nextIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextIdx);
        applyStepState(nextIdx);
      } else {
        setIsPlaying(false);
      }
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, playbackSpeed, applyStepState]);

  function handlePlayPause() {
    if (currentStepIndex === STEPS.length - 1 && !isPlaying) {
      // Replay from start
      setCurrentStepIndex(0);
      applyStepState(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  }

  function handleStepSelect(index: number) {
    setCurrentStepIndex(index);
    applyStepState(index);
    setIsPlaying(false);
  }

  function handleRestart() {
    setCurrentStepIndex(0);
    applyStepState(0);
    setIsPlaying(true);
  }

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto flex flex-col overflow-hidden rounded-2xl border border-border bg-[#0d1117] text-white shadow-2xl transition-all ${
        isFullscreen ? "h-screen w-screen rounded-none" : "max-w-5xl"
      }`}
    >
      {/* Video Browser Header / Title Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#161b22] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <div className="ml-3 flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 font-mono text-xs text-white/70">
            <span className="text-emerald-400">🔒</span>
            <span>https://bridge3.academy{inDashboard ? "/waitlist?id=72b71363" : "/#waitlist"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            HD Interactive Screencast
          </span>
          <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/60">
            Instant Access
          </span>
        </div>
      </div>

      {/* Screen Canvas Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper text-ink select-none sm:aspect-[16/9]">
        {/* Render simulated application */}
        {!inDashboard ? (
          /* HOMEPAGE VIEW */
          <div className="h-full w-full overflow-y-auto bg-paper">
            {/* Header (Note: STRICTLY NO LOGIN BUTTON) */}
            <header className="sticky top-0 z-20 border-b border-border bg-paper/95 px-6 py-3.5 backdrop-blur flex items-center justify-between">
              <div className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20 text-accent font-bold text-xs">
                  B3
                </div>
                <span>Bridge3 Academy</span>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-xs font-medium text-ink-soft">
                <span>Home</span>
                <span>How It Works</span>
                <span>Curriculum</span>
                <span>Tracks</span>
                <span>Docs</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-xs">
                  ☀️
                </div>
                <span className="rounded bg-accent px-3 py-1.5 text-xs font-semibold text-accent-contrast">
                  Join Waitlist
                </span>
              </div>
            </header>

            {/* Hero Section */}
            <div className="p-8 sm:p-12 max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                ✨ Pan-African Web3 Fellowship
              </span>
              <h1 className="mt-3 font-display text-2xl sm:text-4xl font-bold leading-tight text-ink">
                From Zero Knowledge to Verified Web3 Certification
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-ink-soft max-w-lg">
                Structured curriculum, verifiable credentials, and hands-on cohort mentorship without tutorial chaos.
              </p>

              {/* Waitlist Form */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch gap-2.5 max-w-md">
                <div
                  className={`flex-1 rounded-lg border bg-paper-raised px-3.5 py-2.5 text-xs sm:text-sm transition-all ${
                    currentStepIndex === 1
                      ? "border-accent ring-2 ring-accent/20 shadow-md"
                      : "border-border"
                  }`}
                >
                  <span className={typedEmail ? "text-ink font-medium" : "text-ink-muted"}>
                    {typedEmail || "Enter your email"}
                  </span>
                </div>
                <button
                  type="button"
                  className={`whitespace-nowrap rounded-lg bg-accent px-5 py-2.5 text-xs sm:text-sm font-semibold text-accent-contrast transition-all ${
                    isSubmittingHero ? "scale-95 opacity-80" : "hover:bg-accent-hover shadow-sm"
                  }`}
                >
                  {isSubmittingHero ? "Joining…" : "Join Early Access"}
                </button>
              </div>

              <p className="mt-3 text-[11px] text-ink-muted">
                Cohort 1 opens soon. Verification unlocks priority scholarship consideration.
              </p>

              {/* Ecosystem preview cards */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border bg-paper-raised p-3">
                  <p className="text-xs font-bold text-accent">100% Free</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">Community-first education</p>
                </div>
                <div className="rounded-lg border border-border bg-paper-raised p-3">
                  <p className="text-xs font-bold text-accent">On-Chain Credentials</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">Proof of completion</p>
                </div>
                <div className="rounded-lg border border-border bg-paper-raised p-3">
                  <p className="text-xs font-bold text-accent">4 Tracks</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">Developer, DeFi & Design</p>
                </div>
              </div>
            </div>

            {/* Modal Dialog */}
            {showModal && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-fade-in">
                <div className="w-full max-w-sm rounded-xl border border-border bg-paper-raised p-6 shadow-2xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-lg">
                    ✓
                  </div>
                  <h2 className="mt-3 font-display text-lg font-bold text-ink">
                    You’re on the list!
                  </h2>
                  <p className="mt-1 text-xs text-ink-soft">
                    To increase your verification priority and secure early access, complete the onboarding tasks below.
                  </p>

                  <ul className="mt-4 flex flex-col gap-1.5 text-xs text-ink-soft">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Join Telegram community
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Follow X (Twitter)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Share with 3 friends
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Confirm email
                    </li>
                  </ul>

                  <button
                    type="button"
                    className={`mt-5 w-full rounded-lg bg-accent px-4 py-2.5 text-xs font-bold text-accent-contrast shadow transition-all ${
                      currentStepIndex === 4 ? "scale-95 ring-2 ring-accent/30" : "hover:bg-accent-hover"
                    }`}
                  >
                    Go to Verification Tasks Dashboard →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* DASHBOARD VIEW */
          <div className="h-full w-full overflow-y-auto bg-paper p-6 sm:p-8">
            {/* Header section with progress bar */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Early Scholar Access
                </span>
                <h1 className="mt-1.5 font-display text-xl sm:text-2xl font-bold text-ink">
                  Verification Tasks Dashboard
                </h1>
                <p className="text-xs text-ink-muted">
                  Your verification score increases priority onboarding and cohort placement.
                </p>
              </div>

              {/* Progress Box */}
              <div className="min-w-[200px] rounded-xl border border-border bg-paper-raised p-3 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
                  <span>Verification Progress</span>
                  <span className="text-sm font-bold text-accent">{score}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-paper border border-border/60">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-emerald-400 transition-all duration-700 rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-ink-muted text-right">
                  {score >= 75 ? "🎉 Top Tier Scholar Priority!" : `${score}% Completed`}
                </p>
              </div>
            </div>

            {/* Email Verified Banner */}
            {emailConfirmed && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400 flex items-center gap-3 animate-fade-in shadow-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                  ✓
                </span>
                <div>
                  <p className="text-xs font-bold">Email Successfully Verified!</p>
                  <p className="text-[11px] text-emerald-400/80">
                    Your priority ranking has been boosted (+25% score added).
                  </p>
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="mt-5 flex flex-col gap-3.5">
              {/* Task 1: Email */}
              <div className="rounded-xl border border-border bg-paper-raised p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-ink">Confirm email</h3>
                    <span className="rounded bg-paper px-1.5 py-0.5 text-[10px] font-bold text-ink-muted border border-border">
                      +25%
                    </span>
                  </div>
                  {emailConfirmed ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-border bg-paper px-2 py-0.5 text-[11px] text-ink-muted">
                      Pending
                    </span>
                  )}
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-border/50 text-xs">
                  {emailConfirmed ? (
                    <p className="text-emerald-400 font-medium">
                      ✓ Email address verified. Your account priority is recorded.
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-ink-muted">Check your inbox or click:</span>
                      <button
                        type="button"
                        className={`rounded bg-accent px-2.5 py-1 font-semibold text-accent-contrast text-xs transition-all ${
                          currentStepIndex === 8 ? "scale-95 ring-2 ring-accent" : ""
                        }`}
                      >
                        Verify Email Address →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Task 2: Telegram */}
              <div className="rounded-xl border border-border bg-paper-raised p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-ink">Join Telegram community</h3>
                    <span className="rounded bg-paper px-1.5 py-0.5 text-[10px] font-bold text-ink-muted border border-border">
                      +25%
                    </span>
                  </div>
                  {telegramStatus === "completed" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-border bg-paper px-2 py-0.5 text-[11px] text-ink-muted">
                      Not started
                    </span>
                  )}
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-border/50 text-xs">
                  {telegramStatus === "completed" ? (
                    <p className="text-ink-soft">
                      ✓ Verified: <span className="font-mono text-accent">@alex_web3</span>
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded border border-border bg-paper px-2 py-1 text-xs text-ink font-mono">
                        {telegramInput || "@your_telegram_username"}
                      </div>
                      <button
                        type="button"
                        className="rounded bg-accent px-3 py-1 font-semibold text-accent-contrast text-xs"
                      >
                        Submit for Verification
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Task 3: Twitter */}
              <div className="rounded-xl border border-border bg-paper-raised p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-ink">Follow X (Twitter)</h3>
                    <span className="rounded bg-paper px-1.5 py-0.5 text-[10px] font-bold text-ink-muted border border-border">
                      +25%
                    </span>
                  </div>
                  {twitterStatus === "completed" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-border bg-paper px-2 py-0.5 text-[11px] text-ink-muted">
                      Not started
                    </span>
                  )}
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-border/50 text-xs">
                  {twitterStatus === "completed" ? (
                    <p className="text-ink-soft">
                      ✓ Verified: <span className="font-mono text-accent">@alex_builder</span>
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded border border-border bg-paper px-2 py-1 text-xs text-ink font-mono">
                        {twitterInput || "@your_x_handle"}
                      </div>
                      <button
                        type="button"
                        className="rounded bg-accent px-3 py-1 font-semibold text-accent-contrast text-xs"
                      >
                        Submit for Verification
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Task 4: Referral */}
              <div className="rounded-xl border border-border bg-paper-raised p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-ink">Share with 3 friends</h3>
                    <span className="rounded bg-paper px-1.5 py-0.5 text-[10px] font-bold text-ink-muted border border-border">
                      +25%
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-border bg-paper px-2 py-0.5 text-[11px] text-ink-muted">
                    0 of 3 verified
                  </span>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-border/50 text-xs flex items-center gap-2">
                  <div className="flex-1 rounded border border-border bg-paper px-2 py-1 text-[11px] font-mono text-ink-soft truncate">
                    https://bridge3.academy/?ref=72b71363
                  </div>
                  <button
                    type="button"
                    className={`rounded bg-accent px-3 py-1 font-semibold text-accent-contrast text-xs transition-all ${
                      referralCopied ? "bg-emerald-600" : ""
                    }`}
                  >
                    {referralCopied ? "✓ Copied!" : "Copy Invite Link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Animated Realistic Screencast Mouse Cursor */}
        {currentStep.cursor.visible && (
          <div
            className="pointer-events-none absolute z-50 transition-all duration-700 ease-out"
            style={{
              left: `${currentStep.cursor.x}%`,
              top: `${currentStep.cursor.y}%`,
              transform: "translate(-2px, -2px)",
            }}
          >
            {/* Hand / Arrow cursor */}
            <svg
              className={`h-7 w-7 drop-shadow-lg transition-transform ${
                currentStep.cursor.clicking ? "scale-90" : "scale-100"
              }`}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
                fill="#000000"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            </svg>

            {/* Click Ripple Effect */}
            {currentStep.cursor.clicking && (
              <span className="absolute -top-2 -left-2 h-10 w-10 animate-ping rounded-full bg-accent/40" />
            )}
          </div>
        )}

        {/* Subtitle / Closed Caption Narration Overlay */}
        {isAudioSubtitlesOn && (
          <div className="absolute bottom-3 left-4 right-4 z-40 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/85 px-4 py-2 text-center backdrop-blur-md shadow-2xl max-w-2xl">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-contrast">
                {currentStepIndex + 1}
              </span>
              <p className="text-xs sm:text-sm font-medium text-white/95 leading-snug">
                {currentStep.narration}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Control Bar & Timeline */}
      <div className="border-t border-white/10 bg-[#161b22] px-4 py-3">
        {/* Timeline Scrubber */}
        <div className="relative mb-3 flex items-center">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-gradient-to-r from-accent to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={handlePlayPause}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-contrast font-bold transition hover:bg-accent-hover"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            {/* Restart */}
            <button
              type="button"
              onClick={handleRestart}
              className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              title="Replay from start"
            >
              ↺ Replay
            </button>

            {/* Time Indicator */}
            <span className="font-mono text-white/70">
              {currentStep.time} / 01:12
            </span>

            {/* Speed toggle */}
            <div className="flex items-center gap-1 rounded bg-white/5 p-0.5">
              {([1, 1.5, 2] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`rounded px-1.5 py-0.5 text-[11px] font-semibold transition ${
                    playbackSpeed === spd ? "bg-accent text-accent-contrast" : "text-white/60 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Current Step Title */}
          <div className="hidden md:block font-semibold text-white/90">
            {currentStep.title}
          </div>

          <div className="flex items-center gap-2">
            {/* Subtitles Toggle */}
            <button
              type="button"
              onClick={() => setIsAudioSubtitlesOn(!isAudioSubtitlesOn)}
              className={`rounded px-2 py-1 text-xs font-medium transition ${
                isAudioSubtitlesOn ? "bg-white/20 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              [CC] Captions
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? "↙ Exit" : "↗ Fullscreen"}
            </button>

            {/* Download Video Button */}
            <a
              href="/api/download?type=mp4"
              download="bridge3_waitlist_tutorial.mp4"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-contrast shadow transition hover:bg-accent-hover"
              title="Download MP4 Video"
            >
              <span>📥</span>
              <span>Download Video</span>
            </a>

            {/* Try It Live Button */}
            <Link
              href="/#waitlist"
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-emerald-400 shadow"
            >
              Try Live →
            </Link>
          </div>
        </div>

        {/* Chapter / Step Buttons */}
        <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
          {STEPS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStepSelect(idx)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                currentStepIndex === idx
                  ? "bg-accent/30 text-accent font-semibold border border-accent/40"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              {idx + 1}. {s.title.replace(/^\d+\.\s*/, "")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
