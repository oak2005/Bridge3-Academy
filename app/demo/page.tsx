import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistVideoTutorial } from "@/components/demo/WaitlistVideoTutorial";

export const metadata: Metadata = {
  title: "Waitlist & Verification Tutorial Demo — Bridge3 Academy",
  description:
    "Interactive video demo and tutorial on how to join the Bridge3 Academy waitlist, complete scholar verification tasks, and verify your email.",
};

export default function DemoPage({
  searchParams,
}: {
  searchParams?: { step?: string; autoplay?: string };
}) {
  const initialStep = searchParams?.step ? Math.max(0, Math.min(9, parseInt(searchParams.step, 10))) : 0;
  const autoPlay = searchParams?.autoplay !== "false";

  return (
    <div className="mx-auto max-w-content px-6 py-12 md:py-16">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-3 border border-accent/20">
          <span>🎬 Interactive Screencast Tutorial</span>
          <span>&bull;</span>
          <span>Instant Scholar Access</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink">
          How to Join Waitlist & Verify
        </h1>
        <p className="mt-3 text-sm sm:text-base text-ink-muted">
          Watch this complete interactive demo showing step-by-step how to submit your waitlist application, complete scholar verification tasks, and verify your email.
        </p>
      </div>

      {/* Download Action Card */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent/30 bg-accent/10 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-contrast font-bold text-lg">
            📥
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Download Demo Video</h3>
            <p className="text-xs text-ink-muted">High-definition tutorial video showing the full waitlist and verification flow (zero login buttons).</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/download?type=mp4"
            download="bridge3_waitlist_tutorial.mp4"
            className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast transition hover:bg-accent-hover shadow"
          >
            Download Full HD MP4 (1:33 min &bull; 1080p)
          </a>
          <a
            href="/api/download?type=gif"
            download="bridge3_waitlist_tutorial.gif"
            className="rounded-lg border border-border bg-paper-raised px-4 py-2 text-xs font-semibold text-ink transition hover:bg-paper"
          >
            Download GIF (1:33 min)
          </a>
        </div>
      </div>

      {/* Main Video Tutorial Player */}
      <div className="mb-14">
        <WaitlistVideoTutorial initialStep={initialStep} autoPlay={autoPlay} />
      </div>

      {/* Step by Step Breakdown Guide */}
      <div className="mt-16 border-t border-border pt-12">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Step-by-Step Tutorial Guide
          </h2>
          <p className="text-sm text-ink-muted mt-2">
            Follow these 3 simple phases to secure early access and priority cohort consideration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phase 1 */}
          <div className="rounded-2xl border border-border bg-paper-raised p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">
                Join Early Access
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
                Navigate to the waitlist section on the homepage. Enter your active email address and click <strong>Join Early Access</strong>. A unique scholar account ID is instantly created for you.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 text-xs text-ink-soft">
              <span className="font-semibold text-accent">✓ Outcome:</span> Initial waitlist spot secured.
            </div>
          </div>

          {/* Phase 2 */}
          <div className="rounded-2xl border border-border bg-paper-raised p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">
                Complete Verification Tasks
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
                Open your private <strong>Verification Tasks Dashboard</strong>. Submit your Telegram handle (@username) and Twitter handle to earn +25% each, and copy your personal scholar referral link.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 text-xs text-ink-soft">
              <span className="font-semibold text-accent">✓ Outcome:</span> Verification progress score increases.
            </div>
          </div>

          {/* Phase 3 */}
          <div className="rounded-2xl border border-border bg-paper-raised p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">
                Verify Scholar Email
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
                Click the confirmation link sent to your email (or use instant verification). Once verified, you receive a confirmed status banner and maximize your priority for scholarship cohorts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 text-xs text-ink-soft">
              <span className="font-semibold text-accent">✓ Outcome:</span> Verified Scholar Priority tier unlocked!
            </div>
          </div>
        </div>

        {/* Live CTA Section */}
        <div className="mt-12 rounded-2xl border border-accent/30 bg-gradient-to-tr from-accent/10 via-paper-raised to-accent/5 p-8 text-center max-w-2xl mx-auto shadow-md">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
            Ready to Join the Next Web3 Cohort?
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-ink-muted">
            It takes less than 60 seconds to reserve your spot and complete your scholar verification.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/#waitlist"
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast transition hover:bg-accent-hover shadow"
            >
              Join the Waitlist Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
