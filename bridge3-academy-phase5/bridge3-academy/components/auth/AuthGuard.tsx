"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/auth/useProfile";

type Stage = "profile" | "onboarding" | "dashboard";

export function AuthGuard({
  stage,
  children,
}: {
  stage: Stage;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { loading, session, profile } = useProfile();

  const needsProfileInfo = profile ? !profile.university || !profile.role_interest : false;
  const needsOnboarding = profile ? !profile.onboarding_completed : false;

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace("/login");
      return;
    }

    if (!profile) return; // profile row is still being created/loaded

    if (stage !== "profile" && needsProfileInfo) {
      router.replace("/onboarding/profile");
      return;
    }
    if (stage === "profile" && !needsProfileInfo) {
      router.replace(needsOnboarding ? "/onboarding" : "/dashboard");
      return;
    }
    if (stage !== "onboarding" && stage !== "profile" && needsOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (stage === "onboarding" && !needsOnboarding) {
      router.replace("/dashboard");
      return;
    }
  }, [loading, session, profile, needsProfileInfo, needsOnboarding, stage, router]);

  if (loading || !session || !profile) {
    return (
      <div className="mx-auto max-w-content px-6 py-24">
        <p className="text-ink-muted">Loading…</p>
      </div>
    );
  }

  // If a redirect is about to happen, avoid flashing the wrong page's
  // content for a frame while the router.replace above is in flight.
  const redirecting =
    (stage !== "profile" && needsProfileInfo) ||
    (stage === "profile" && !needsProfileInfo) ||
    (stage !== "onboarding" && stage !== "profile" && needsOnboarding) ||
    (stage === "onboarding" && !needsOnboarding);

  if (redirecting) {
    return (
      <div className="mx-auto max-w-content px-6 py-24">
        <p className="text-ink-muted">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
