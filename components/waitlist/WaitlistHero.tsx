"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEFAULT_SITE_SETTINGS } from "@/lib/settings/constants";

export function WaitlistHero() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [signupId, setSignupId] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) setSiteSettings(data.settings);
        }
      } catch (err) {
        console.error("Could not load dynamic site settings:", err);
      }
    }
    loadSettings();
  }, []);

  // Capture a referral on first visit, so it survives even if the person
  // doesn't sign up immediately. First-touch only: if a referral is
  // already saved, a second link doesn't overwrite it. Ignores a link
  // that's just someone viewing their own referral link.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;

    const ownId = localStorage.getItem("b3a_waitlist_id");
    const alreadyHasReferral = localStorage.getItem("b3a_referred_by");

    if (ref === ownId) return;
    if (!alreadyHasReferral) {
      localStorage.setItem("b3a_referred_by", ref);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const referredBy = localStorage.getItem("b3a_referred_by");
      const res = await fetch("/api/waitlist/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referredBy }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Try again.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("b3a_waitlist_id", data.id);
        localStorage.removeItem("b3a_referred_by");
      }
      setSignupId(data.id);
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Try again.");
    }
  }

  function goToDashboard() {
    if (signupId) router.push(`/waitlist?id=${signupId}`);
  }

  return (
    <section id="waitlist" className="border-b border-border py-20">
      <div className="mx-auto grid max-w-content items-center gap-12 px-6 md:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">
            {siteSettings.heroHeadline}
          </h1>
          <p className="mt-4 max-w-prose text-ink-soft">
            {siteSettings.heroSubheadline}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded border border-border bg-paper-raised px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-accent"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="whitespace-nowrap rounded bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {status === "submitting" ? "Joining…" : siteSettings.heroCtaText || "Join Early Access"}
            </button>
          </form>

          {status === "error" && (
            <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
          )}

          <p className="mt-3 text-sm text-ink-muted">
            {siteSettings.heroAnnouncement}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent/20 transition-all shadow-sm group"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-contrast text-[10px] font-bold group-hover:scale-110 transition-transform">
                ▶
              </span>
              <span>Watch Video Demo & Tutorial</span>
              <span className="text-accent/60 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
            <Link
              href="/#curriculum"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink transition-colors"
            >
              <span>Explore learning paths:</span>
              <span className="text-accent-hover underline">View Curriculum Tracks →</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Hero Illustration Slot */}
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-border bg-paper-raised p-6 shadow-sm transition-all hover:border-border/80">
          {siteSettings.illustrationUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={siteSettings.illustrationUrl}
              alt={siteSettings.illustrationCaption || "Bridge3 Web3 Ecosystem"}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent/20 to-accent-hover/30 border border-accent/30 shadow-inner">
                <span className="text-3xl font-display text-accent">B3</span>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-accent" />
                </span>
              </div>
              <div>
                <p className="font-display text-base font-semibold text-ink">Bridge3 Web3 Ecosystem</p>
                <p className="mt-1 text-xs text-ink-muted max-w-xs">
                  Structured curriculum &bull; Verifiable credentials &bull; Pan-African talent network
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {signupId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-paper-raised p-7 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎉</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                You&rsquo;re on the list!
              </span>
            </div>

            <h2 className="mt-3 font-display text-2xl text-ink">Follow Official Accounts &amp; Get Verified</h2>
            <p className="mt-2 text-xs sm:text-sm text-ink-soft leading-relaxed">
              To secure your early scholar access and priority cohort placement, follow our official channels and complete your assigned verification tasks.
            </p>

            <div className="mt-5 space-y-2.5 rounded-xl border border-border/80 bg-paper p-4 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="text-sm">📢</span>
                <div>
                  <span className="font-semibold text-ink">Follow Official Accounts:</span>
                  <p className="text-ink-muted mt-0.5">Stay updated on Telegram &amp; X (Twitter) for official cohort announcements.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-border/60">
                <span className="text-sm">⭐</span>
                <div>
                  <span className="font-semibold text-ink">Boost Your Verification Score:</span>
                  <p className="text-ink-muted mt-0.5">Complete verification tasks to maximize your admissions priority.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={goToDashboard}
              className="mt-6 w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast shadow-sm transition-all hover:bg-accent-hover hover:shadow-md"
            >
              Go to Verification Tasks Dashboard →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
