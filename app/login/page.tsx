"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/settings/constants";

function LoginContent() {
  const searchParams = useSearchParams();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deactivated, setDeactivated] = useState(false);
  const [restrictionError, setRestrictionError] = useState<"registration_closed" | "waitlist_unverified" | "access_denied" | null>(null);

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

  useEffect(() => {
    if (searchParams.get("deactivated") === "1") {
      setDeactivated(true);
    }
    const err = searchParams.get("error");
    if (err === "student_registration_closed" || err === "registration_closed") {
      setRestrictionError("registration_closed");
    } else if (err === "waitlist_verification_required" || err === "waitlist_not_verified") {
      setRestrictionError("waitlist_unverified");
    } else if (err === "access_denied") {
      setRestrictionError("access_denied");
    }
  }, [searchParams]);

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
    // On success, the browser redirects to Google — no further code runs here.
  }

  const isClosed = !siteSettings.registrationOpen;

  return (
    <div className="mx-auto flex max-w-content flex-col items-center px-6 py-24">
      <div className="w-full max-w-sm rounded-xl border border-border bg-paper-raised p-8 text-center shadow-sm">
        {/* Dynamic header badge based on registration gate */}
        {isClosed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Authorized Access
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Verified Scholar Access
          </span>
        )}

        <h1 className="mt-3 font-display text-2xl text-ink">
          Sign in to Bridge3
        </h1>

        <p className="mt-2 text-sm text-ink-muted">
          {isClosed
            ? "Public student registration is currently closed. If you have an authorized team account, sign in with your Google account below."
            : "Sign in with your Google account. Access is open for verified waitlist scholars."}
        </p>

        {/* Informative restriction alert if bounced by gate */}
        {restrictionError === "registration_closed" && (
          <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-left">
            <p className="text-xs font-semibold text-amber-500">Student Registration Currently Closed</p>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              Public student registration has not officially opened yet. Waitlist scholars will be granted access as soon as cohort enrollment opens.
            </p>
            <div className="mt-3">
              <Link
                href="/#waitlist"
                className="inline-block rounded bg-accent px-3 py-1.5 text-xs font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
              >
                Join Waitlist / Check Tasks →
              </Link>
            </div>
          </div>
        )}

        {restrictionError === "waitlist_unverified" && (
          <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-left">
            <p className="text-xs font-semibold text-amber-500">Waitlist Verification Required</p>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              Registration is currently restricted to verified waitlist scholars. Please join the waitlist and complete your verification tasks first.
            </p>
            <div className="mt-3">
              <Link
                href="/#waitlist"
                className="inline-block rounded bg-accent px-3 py-1.5 text-xs font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
              >
                Go to Verification Dashboard →
              </Link>
            </div>
          </div>
        )}

        {restrictionError === "access_denied" && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-left">
            <p className="text-xs font-semibold text-red-500">Access Restricted</p>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              Your account does not have permission to access the platform at this time.
            </p>
          </div>
        )}

        {deactivated && (
          <div className="mt-6 rounded-lg border border-border bg-paper px-4 py-3 text-left">
            <p className="text-sm font-medium text-ink">This account isn&rsquo;t active</p>
            <p className="mt-1 text-xs text-ink-muted">
              Your access has been paused. Reach out to the Bridge3 Academy team
              if you think this is a mistake.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading || loadingSettings}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded border border-border bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent disabled:opacity-60 shadow-sm"
        >
          <GoogleIcon />
          {loading ? "Redirecting…" : isClosed ? "Continue with Authorized Google Account" : "Continue with Google"}
        </button>

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

        {isClosed ? (
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs text-ink-muted">
              Looking for student early access?{" "}
              <Link href="/#waitlist" className="font-semibold text-accent-hover hover:underline">
                Join the Waitlist
              </Link>
            </p>
          </div>
        ) : (
          <p className="mt-6 text-xs text-ink-muted">
            New verified scholar?{" "}
            <Link href="/signup" className="font-semibold text-accent-hover hover:underline">
              Create your account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="px-6 py-24 text-center text-ink-muted">Loading…</p>}>
      <LoginContent />
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
