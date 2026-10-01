"use client";

import { useState, useEffect, Suspense } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/settings/constants";

function SignupContent() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) setSiteSettings(data.settings);
        }
      } catch (e) {
        console.error("Could not load site settings:", e);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  async function signInWithGoogle() {
    setLoading(true);
    setError("");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error: signInError } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/auth/callback` },
    });
    if (signInError) {
      setError("Could not start Google sign-in. Try again.");
      setLoading(false);
    }
  }

  if (loadingSettings) {
    return (
      <div className="mx-auto flex max-w-content flex-col items-center px-6 py-24 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="mt-4 text-sm text-ink-muted">Checking registration status…</p>
      </div>
    );
  }

  // When registration is NOT officially opened:
  // Public users and waitlist users cannot access or see the Sign Up button.
  if (!siteSettings.registrationOpen) {
    return (
      <div className="mx-auto flex max-w-content flex-col items-center px-6 py-24">
        <div className="w-full max-w-md rounded-xl border border-border bg-paper-raised p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <span className="text-xl">🔒</span>
          </div>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            Waitlist Mode Active
          </span>

          <h1 className="mt-3 font-display text-2xl text-ink">Registration is Currently Closed</h1>
          
          <p className="mt-3 text-sm text-ink-soft leading-relaxed">
            Public student registration has not officially opened yet. Bridge3 Academy operates on a verified waitlist cohort system.
          </p>

          <div className="mt-6 rounded-lg border border-border bg-paper p-4 text-left">
            <p className="text-xs font-semibold text-ink">Have you completed Waitlist Verification?</p>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              Verified waitlist scholars will receive priority onboarding invitations the moment registration officially launches.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/#waitlist"
              className="flex w-full items-center justify-center rounded bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover shadow-sm"
            >
              Join Waitlist / Check Status →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // When registration IS officially opened for verified waitlist scholars
  return (
    <div className="mx-auto flex max-w-content flex-col items-center px-6 py-24">
      <div className="w-full max-w-sm rounded-xl border border-border bg-paper-raised p-8 text-center shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Verified Scholar Enrollment Open
        </span>

        <h1 className="mt-3 font-display text-2xl text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Registration is open for verified waitlist scholars. Continue with the Google account associated with your waitlist email.
        </p>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded border border-border bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent disabled:opacity-60"
        >
          <GoogleIcon />
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

        <p className="mt-6 text-xs text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent-hover hover:underline">
            Sign in
          </Link>
        </p>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-[11px] text-ink-muted">
            Not verified yet?{" "}
            <Link href="/waitlist" className="font-semibold text-accent hover:underline">
              Complete your verification tasks first
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<p className="px-6 py-24 text-center text-ink-muted">Loading…</p>}>
      <SignupContent />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
