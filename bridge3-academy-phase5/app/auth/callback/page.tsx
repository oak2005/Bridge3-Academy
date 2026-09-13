"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function completeSignIn() {
      // supabase-js processes the OAuth redirect automatically on load, but
      // that can take a moment, so we give it a few short retries rather
      // than checking exactly once.
      for (let attempt = 0; attempt < 10; attempt++) {
        const { data } = await supabaseBrowser.auth.getSession();
        if (data.session) {
          const userId = data.session.user.id;
          const { data: profile } = await supabaseBrowser
            .from("profiles")
            .select("university, role_interest, onboarding_completed")
            .eq("id", userId)
            .maybeSingle();

          if (cancelled) return;

          if (!profile || !profile.university || !profile.role_interest) {
            router.replace("/onboarding/profile");
          } else if (!profile.onboarding_completed) {
            router.replace("/onboarding");
          } else {
            router.replace("/dashboard");
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 300));
      }
      if (!cancelled) {
        setError("Sign-in didn't complete. Please try again.");
      }
    }

    completeSignIn();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="mx-auto max-w-content px-6 py-24 text-center">
      {error ? (
        <>
          <p className="text-red-700">{error}</p>
          <a href="/login" className="mt-3 inline-block text-sm font-semibold text-accent-hover underline">
            Back to login
          </a>
        </>
      ) : (
        <p className="text-ink-muted">Signing you in…</p>
      )}
    </div>
  );
}
