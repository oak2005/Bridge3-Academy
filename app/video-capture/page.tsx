"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const STEPS_DATA = [
  {
    step: 0,
    title: "1. Access Early Access Waitlist",
    subtitle: "Welcome to Bridge3 Academy — Structured Web3 Education. Notice the clean, seamless interface.",
    inDashboard: false,
    typedEmail: "",
    isSubmitting: false,
    showModal: false,
    modalButtonActive: false,
    score: 0,
    emailConfirmed: false,
    telegramStatus: "not_started",
    telegramInput: "",
    twitterStatus: "not_started",
    twitterInput: "",
    referralCopied: false,
    cursor: { x: 50, y: 35, clicking: false, visible: true },
  },
  {
    step: 1,
    title: "2. Locate Waitlist Form",
    subtitle: "Locate the Early Access Waitlist section on the homepage.",
    inDashboard: false,
    typedEmail: "",
    isSubmitting: false,
    showModal: false,
    modalButtonActive: false,
    score: 0,
    emailConfirmed: false,
    telegramStatus: "not_started",
    telegramInput: "",
    twitterStatus: "not_started",
    twitterInput: "",
    referralCopied: false,
    cursor: { x: 34, y: 53, clicking: true, visible: true },
  },
  {
    step: 2,
    title: "3. Enter Scholar Email",
    subtitle: "Enter your active email address to reserve your placement in the upcoming cohort.",
    inDashboard: false,
    typedEmail: "scholar.alex@bridge3.org",
    isSubmitting: false,
    showModal: false,
    modalButtonActive: false,
    score: 0,
    emailConfirmed: false,
    telegramStatus: "not_started",
    telegramInput: "",
    twitterStatus: "not_started",
    twitterInput: "",
    referralCopied: false,
    cursor: { x: 38, y: 53, clicking: false, visible: true },
  },
  {
    step: 3,
    title: "4. Submit Application",
    subtitle: "Click 'Join Early Access' to generate your private scholar identity.",
    inDashboard: false,
    typedEmail: "scholar.alex@bridge3.org",
    isSubmitting: true,
    showModal: false,
    modalButtonActive: false,
    score: 0,
    emailConfirmed: false,
    telegramStatus: "not_started",
    telegramInput: "",
    twitterStatus: "not_started",
    twitterInput: "",
    referralCopied: false,
    cursor: { x: 44, y: 53, clicking: true, visible: true },
  },
  {
    step: 4,
    title: "5. Confirmation & Onboarding Checklist",
    subtitle: "Confirmation modal appears displaying the onboarding checklist to boost your priority.",
    inDashboard: false,
    typedEmail: "scholar.alex@bridge3.org",
    isSubmitting: false,
    showModal: true,
    modalButtonActive: false,
    score: 0,
    emailConfirmed: false,
    telegramStatus: "not_started",
    telegramInput: "",
    twitterStatus: "not_started",
    twitterInput: "",
    referralCopied: false,
    cursor: { x: 50, y: 64, clicking: false, visible: true },
  },
  {
    step: 5,
    title: "6. Proceed to Tasks Dashboard",
    subtitle: "Click 'Go to Verification Tasks Dashboard' to access your private scoring page.",
    inDashboard: false,
    typedEmail: "scholar.alex@bridge3.org",
    isSubmitting: false,
    showModal: true,
    modalButtonActive: true,
    score: 0,
    emailConfirmed: false,
    telegramStatus: "not_started",
    telegramInput: "",
    twitterStatus: "not_started",
    twitterInput: "",
    referralCopied: false,
    cursor: { x: 50, y: 65, clicking: true, visible: true },
  },
  {
    step: 6,
    title: "7. Verification Tasks Dashboard",
    subtitle: "Arrive at your personal Tasks Dashboard. The verification score tracks your onboarding progress.",
    inDashboard: true,
    typedEmail: "",
    isSubmitting: false,
    showModal: false,
    modalButtonActive: false,
    score: 0,
    emailConfirmed: false,
    telegramStatus: "not_started",
    telegramInput: "",
    twitterStatus: "not_started",
    twitterInput: "",
    referralCopied: false,
    cursor: { x: 82, y: 15, clicking: false, visible: true },
  },
  {
    step: 7,
    title: "8. Complete Telegram Task",
    subtitle: "Task 1: Submit your Telegram username to connect with the scholar community.",
    inDashboard: true,
    typedEmail: "",
    isSubmitting: false,
    showModal: false,
    modalButtonActive: false,
    score: 0,
    emailConfirmed: false,
    telegramStatus: "not_started",
    telegramInput: "@alex_web3",
    twitterStatus: "not_started",
    twitterInput: "",
    referralCopied: false,
    cursor: { x: 62, y: 44, clicking: true, visible: true },
  },
  {
    step: 8,
    title: "9. Telegram Verified (+25% Score Boost)",
    subtitle: "Telegram task is verified! Your progress score increases by +25%.",
    inDashboard: true,
    typedEmail: "",
    isSubmitting: false,
    showModal: false,
    modalButtonActive: false,
    score: 25,
    emailConfirmed: false,
    telegramStatus: "completed",
    telegramInput: "@alex_web3",
    twitterStatus: "not_started",
    twitterInput: "",
    referralCopied: false,
    cursor: { x: 68, y: 44, clicking: false, visible: true },
  },
  {
    step: 9,
    title: "10. Follow X (Twitter) Task (+25% Score)",
    subtitle: "Task 2: Follow @Bridge3Academy on X and submit your handle for +25% progress.",
    inDashboard: true,
    typedEmail: "",
    isSubmitting: false,
    showModal: false,
    modalButtonActive: false,
    score: 50,
    emailConfirmed: false,
    telegramStatus: "completed",
    telegramInput: "@alex_web3",
    twitterStatus: "completed",
    twitterInput: "@alex_builder",
    referralCopied: false,
    cursor: { x: 62, y: 62, clicking: true, visible: true },
  },
  {
    step: 10,
    title: "11. Copy Scholar Referral Link",
    subtitle: "Task 3: Copy your unique scholar referral link to invite fellow builders.",
    inDashboard: true,
    typedEmail: "",
    isSubmitting: false,
    showModal: false,
    modalButtonActive: false,
    score: 50,
    emailConfirmed: false,
    telegramStatus: "completed",
    telegramInput: "@alex_web3",
    twitterStatus: "completed",
    twitterInput: "@alex_builder",
    referralCopied: true,
    cursor: { x: 74, y: 80, clicking: true, visible: true },
  },
  {
    step: 11,
    title: "12. Verify Scholar Email",
    subtitle: "Task 4: Confirm your scholar email address to authenticate your account.",
    inDashboard: true,
    typedEmail: "",
    isSubmitting: false,
    showModal: false,
    modalButtonActive: false,
    score: 50,
    emailConfirmed: false,
    telegramStatus: "completed",
    telegramInput: "@alex_web3",
    twitterStatus: "completed",
    twitterInput: "@alex_builder",
    referralCopied: true,
    cursor: { x: 44, y: 28, clicking: true, visible: true },
  },
  {
    step: 12,
    title: "13. Email Verified & Score Reaches 75%+",
    subtitle: "Email successfully verified! Your priority status is unlocked and recorded.",
    inDashboard: true,
    typedEmail: "",
    isSubmitting: false,
    showModal: false,
    modalButtonActive: false,
    score: 75,
    emailConfirmed: true,
    telegramStatus: "completed",
    telegramInput: "@alex_web3",
    twitterStatus: "completed",
    twitterInput: "@alex_builder",
    referralCopied: true,
    cursor: { x: 80, y: 22, clicking: false, visible: false },
  },
  {
    step: 13,
    title: "14. Top Tier Scholar Priority Achieved",
    subtitle: "Congratulations! You have completed all onboarding tasks and secured early access.",
    inDashboard: true,
    typedEmail: "",
    isSubmitting: false,
    showModal: false,
    modalButtonActive: false,
    score: 75,
    emailConfirmed: true,
    telegramStatus: "completed",
    telegramInput: "@alex_web3",
    twitterStatus: "completed",
    twitterInput: "@alex_builder",
    referralCopied: true,
    cursor: { x: 85, y: 15, clicking: false, visible: false },
  },
];

function FullscreenCaptureInner() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const stepIdx = stepParam ? Math.max(0, Math.min(STEPS_DATA.length - 1, parseInt(stepParam, 10))) : 0;
  const data = STEPS_DATA[stepIdx];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-paper text-ink select-none font-sans flex flex-col justify-between">
      {/* 1. TOP APPLICATION NAVIGATION HEADER (STRICTLY NO LOGIN BUTTON) */}
      <header className="w-full shrink-0 border-b border-border bg-paper/95 px-8 py-4 backdrop-blur flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent font-bold text-sm shadow-inner">
            B3
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Bridge3 Academy
          </span>
        </div>

        <nav className="flex items-center gap-8 text-sm font-medium text-ink-soft">
          <span className="text-ink font-semibold">Home</span>
          <span>How It Works</span>
          <span>Curriculum</span>
          <span>Tracks</span>
          <span>Docs</span>
          <span>FAQs</span>
          <span>About</span>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs">
            ☀️
          </div>
          <div className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast shadow-sm">
            Join Waitlist
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA (100% FULL SCREEN) */}
      <main className="flex-1 w-full overflow-hidden relative flex flex-col">
        {!data.inDashboard ? (
          /* HOMEPAGE VIEW */
          <div className="flex-1 w-full flex items-center justify-center px-12 py-8">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
              {/* Left Column: Hero Text & Waitlist Form */}
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1 text-xs font-semibold text-accent border border-accent/20">
                  ✨ Pan-African Web3 Fellowship
                </span>

                <h1 className="mt-4 font-display text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-ink">
                  From Zero Knowledge to Verified Web3 Certification
                </h1>

                <p className="mt-4 text-base text-ink-soft max-w-lg leading-relaxed">
                  Structured curriculum, verifiable credentials, and hands-on cohort mentorship without tutorial chaos.
                </p>

                {/* Waitlist Form */}
                <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3 max-w-lg">
                  <div
                    className={`flex-1 rounded-xl border bg-paper-raised px-4 py-3.5 text-sm transition-all flex items-center ${
                      data.step === 1 || data.step === 2
                        ? "border-accent ring-2 ring-accent/20 shadow-md bg-paper"
                        : "border-border"
                    }`}
                  >
                    <span className={data.typedEmail ? "text-ink font-semibold" : "text-ink-muted"}>
                      {data.typedEmail || "Enter your email"}
                    </span>
                    {(data.step === 1 || data.step === 2) && (
                      <span className="ml-1 inline-block h-4 w-0.5 bg-accent animate-pulse" />
                    )}
                  </div>

                  <button
                    type="button"
                    className={`whitespace-nowrap rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-accent-contrast transition-all shadow-md ${
                      data.isSubmitting ? "scale-95 opacity-85" : "hover:bg-accent-hover"
                    }`}
                  >
                    {data.isSubmitting ? "Joining…" : "Join Early Access"}
                  </button>
                </div>

                <p className="mt-4 text-xs text-ink-muted">
                  Cohort 1 opens soon. Verification unlocks priority scholarship consideration.
                </p>

                {/* 3 Value Pillars */}
                <div className="mt-10 grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border bg-paper-raised p-4 shadow-sm">
                    <p className="text-sm font-bold text-accent">100% Free</p>
                    <p className="text-xs text-ink-soft mt-1">Community-first education</p>
                  </div>
                  <div className="rounded-xl border border-border bg-paper-raised p-4 shadow-sm">
                    <p className="text-sm font-bold text-accent">On-Chain Credentials</p>
                    <p className="text-xs text-ink-soft mt-1">Proof of completion</p>
                  </div>
                  <div className="rounded-xl border border-border bg-paper-raised p-4 shadow-sm">
                    <p className="text-sm font-bold text-accent">4 Tracks</p>
                    <p className="text-xs text-ink-soft mt-1">Developer, DeFi & Design</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Graphic */}
              <div className="relative flex aspect-square max-h-[460px] items-center justify-center overflow-hidden rounded-3xl border border-border bg-paper-raised p-8 shadow-md">
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-accent/20 to-accent-hover/30 border border-accent/40 shadow-xl">
                    <span className="text-5xl font-display font-bold text-accent">B3</span>
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-accent" />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">Bridge3 Web3 Ecosystem</h3>
                    <p className="mt-2 text-xs text-ink-muted max-w-xs leading-relaxed">
                      Structured curriculum &bull; Verifiable credentials &bull; Pan-African talent network
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Dialog */}
            {data.showModal && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                <div className="w-full max-w-md rounded-2xl border border-border bg-paper-raised p-8 shadow-2xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent font-bold text-2xl mb-4">
                    ✓
                  </div>
                  <h2 className="font-display text-2xl font-bold text-ink">
                    You’re on the list!
                  </h2>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                    To increase your verification priority and secure early access, complete the onboarding tasks below.
                  </p>

                  <ul className="mt-5 flex flex-col gap-2.5 text-sm text-ink-soft">
                    <li className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      Join Telegram community
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      Follow X (Twitter)
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      Share with 3 friends
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      Confirm email
                    </li>
                  </ul>

                  <button
                    type="button"
                    className={`mt-6 w-full rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-contrast shadow-md transition-all ${
                      data.modalButtonActive ? "scale-95 ring-4 ring-accent/30" : "hover:bg-accent-hover"
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
          <div className="flex-1 w-full max-w-6xl mx-auto px-12 py-8 flex flex-col justify-start">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  Early Scholar Access
                </span>
                <h1 className="mt-2 font-display text-3xl font-bold text-ink">
                  Verification Tasks Dashboard
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                  Your verification score increases priority onboarding, scholarship consideration, and private cohort placement.
                </p>
              </div>

              {/* Score Card */}
              <div className="min-w-[260px] rounded-2xl border border-border bg-paper-raised p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-ink-soft">
                  <span>Verification Progress</span>
                  <span className="text-base font-bold text-accent">{data.score}%</span>
                </div>
                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-paper border border-border/60">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-emerald-400 transition-all duration-700 rounded-full"
                    style={{ width: `${data.score}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-ink-muted text-right">
                  {data.score >= 75 ? "🎉 Top Tier Scholar Priority!" : `${data.score}% Completed`}
                </p>
              </div>
            </div>

            {/* Email Verified Banner */}
            {data.emailConfirmed && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 flex items-center gap-3 animate-fade-in shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-base">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-bold">Email Successfully Verified!</p>
                  <p className="text-xs text-emerald-400/80">
                    Your priority ranking has been boosted (+25% score added).
                  </p>
                </div>
              </div>
            )}

            {/* Task Cards Grid */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task 1: Email */}
              <div className="rounded-xl border border-border bg-paper-raised p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-ink">Confirm email</h3>
                      <span className="rounded bg-paper px-2 py-0.5 text-[10px] font-bold text-ink-muted border border-border">
                        +25%
                      </span>
                    </div>
                    {data.emailConfirmed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                        ✓ Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-border bg-paper px-2.5 py-0.5 text-xs text-ink-muted">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-ink-muted">
                    Check your inbox for the confirmation link — automatic verification.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 text-xs">
                  {data.emailConfirmed ? (
                    <p className="text-emerald-400 font-semibold">
                      ✓ Email address verified. Your account priority is recorded.
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-ink-muted">Inbox link or click:</span>
                      <button
                        type="button"
                        className={`rounded-lg bg-accent px-3 py-1.5 font-bold text-accent-contrast text-xs transition-all ${
                          data.step === 11 ? "scale-95 ring-2 ring-accent" : "hover:bg-accent-hover"
                        }`}
                      >
                        Verify Email Address →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Task 2: Telegram */}
              <div className="rounded-xl border border-border bg-paper-raised p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-ink">Join Telegram community</h3>
                      <span className="rounded bg-paper px-2 py-0.5 text-[10px] font-bold text-ink-muted border border-border">
                        +25%
                      </span>
                    </div>
                    {data.telegramStatus === "completed" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                        ✓ Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-border bg-paper px-2.5 py-0.5 text-xs text-ink-muted">
                        Not started
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-ink-muted">
                    Connect with fellow scholars, mentors, and receive official announcements.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 text-xs">
                  {data.telegramStatus === "completed" ? (
                    <p className="text-ink font-semibold">
                      ✓ Verified: <span className="font-mono text-accent">@alex_web3</span>
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-border bg-paper px-3 py-1.5 text-xs text-ink font-mono">
                        {data.telegramInput || "@your_telegram_username"}
                      </div>
                      <button
                        type="button"
                        className={`rounded-lg bg-accent px-3.5 py-1.5 font-bold text-accent-contrast text-xs ${
                          data.step === 7 ? "scale-95" : ""
                        }`}
                      >
                        Submit for Verification
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Task 3: Twitter */}
              <div className="rounded-xl border border-border bg-paper-raised p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-ink">Follow X (Twitter)</h3>
                      <span className="rounded bg-paper px-2 py-0.5 text-[10px] font-bold text-ink-muted border border-border">
                        +25%
                      </span>
                    </div>
                    {data.twitterStatus === "completed" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                        ✓ Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-border bg-paper px-2.5 py-0.5 text-xs text-ink-muted">
                        Not started
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-ink-muted">
                    Follow @Bridge3Academy on X for announcements and ecosystem updates.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 text-xs">
                  {data.twitterStatus === "completed" ? (
                    <p className="text-ink font-semibold">
                      ✓ Verified: <span className="font-mono text-accent">@alex_builder</span>
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-border bg-paper px-3 py-1.5 text-xs text-ink font-mono">
                        {data.twitterInput || "@your_x_handle"}
                      </div>
                      <button
                        type="button"
                        className={`rounded-lg bg-accent px-3.5 py-1.5 font-bold text-accent-contrast text-xs ${
                          data.step === 9 ? "scale-95" : ""
                        }`}
                      >
                        Submit for Verification
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Task 4: Referral */}
              <div className="rounded-xl border border-border bg-paper-raised p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-ink">Share with 3 friends</h3>
                      <span className="rounded bg-paper px-2 py-0.5 text-[10px] font-bold text-ink-muted border border-border">
                        +25%
                      </span>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-border bg-paper px-2.5 py-0.5 text-xs text-ink-muted">
                      0 of 3 verified
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-ink-muted">
                    Invite fellow learners. Generates your personal invite code and counts verified signups.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 text-xs flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-border bg-paper px-3 py-1.5 text-xs font-mono text-ink-soft truncate">
                    https://bridge3.academy/?ref=72b71363
                  </div>
                  <button
                    type="button"
                    className={`rounded-lg bg-accent px-4 py-1.5 font-bold text-accent-contrast text-xs transition-all ${
                      data.referralCopied ? "bg-emerald-600" : ""
                    }`}
                  >
                    {data.referralCopied ? "✓ Copied!" : "Copy Invite Link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. REALISTIC MOUSE CURSOR */}
        {data.cursor.visible && (
          <div
            className="pointer-events-none absolute z-50 transition-all duration-500 ease-out"
            style={{
              left: `${data.cursor.x}%`,
              top: `${data.cursor.y}%`,
            }}
          >
            <svg
              className={`h-8 w-8 drop-shadow-xl transition-transform ${
                data.cursor.clicking ? "scale-90" : "scale-100"
              }`}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
                fill="#059669"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </svg>

            {data.cursor.clicking && (
              <span className="absolute -top-3 -left-3 h-12 w-12 animate-ping rounded-full bg-emerald-500/50" />
            )}
          </div>
        )}
      </main>

      {/* 4. BOTTOM VIDEO SUBTITLE / CLOSED CAPTION BAR */}
      <footer className="w-full shrink-0 border-t border-border bg-paper-raised/95 px-8 py-3.5 backdrop-blur z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-contrast font-bold text-xs">
            {data.step + 1}
          </div>
          <div>
            <span className="text-xs font-bold text-accent mr-2 uppercase tracking-wider">
              {data.title}
            </span>
            <span className="text-sm font-medium text-ink">
              {data.subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-md bg-paper border border-border px-2.5 py-1 text-xs font-mono text-ink-muted">
            Step {data.step + 1} / {STEPS_DATA.length}
          </span>
          <span className="rounded-md bg-accent/10 border border-accent/20 px-2.5 py-1 text-xs font-semibold text-accent">
            HD Full Screen Demo
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function FullscreenCapturePage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-paper" />}>
      <FullscreenCaptureInner />
    </Suspense>
  );
}
