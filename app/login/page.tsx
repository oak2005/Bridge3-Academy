"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function LoginContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deactivated, setDeactivated] = useState(false);

  useEffect(() => {
    if (searchParams.get("deactivated") === "1") setDeactivated(true);
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

  return (
    <div className="mx-auto flex max-w-content flex-col items-center px-6 py-24">
      <div className="w-full max-w-sm rounded border border-border bg-paper-raised p-8 text-center">
        <h1 className="font-display text-2xl text-ink">Welcome to Bridge3 Academy</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Sign in with Google to start or continue your learning path.
        </p>

        {deactivated && (
          <div className="mt-6 rounded border border-border bg-paper px-4 py-3 text-left">
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
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded border border-border bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent disabled:opacity-60"
        >
          <GoogleIcon />
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
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
