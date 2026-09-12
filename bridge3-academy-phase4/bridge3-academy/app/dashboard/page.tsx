"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useProfile } from "@/lib/auth/useProfile";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function DashboardContent() {
  const router = useRouter();
  const { profile } = useProfile();

  async function signOut() {
    await supabaseBrowser.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="mx-auto max-w-content px-6 py-24">
      <h1 className="font-display text-2xl text-ink">
        Welcome, {profile?.full_name || "there"}
      </h1>
      <p className="mt-2 text-ink-muted">
        Role: <span className="font-medium text-ink">{profile?.role}</span> · Track:{" "}
        <span className="font-medium text-ink">{profile?.track}</span> · Level:{" "}
        <span className="font-medium text-ink">{profile?.level}</span>
      </p>
      <p className="mt-6 max-w-prose text-sm text-ink-muted">
        This proves sign-in, profile creation, and onboarding all worked end to
        end. The real dashboard (courses, progress, today&rsquo;s lesson) is built in
        Phase 5.
      </p>
      <button
        type="button"
        onClick={signOut}
        className="mt-8 rounded border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:border-accent"
      >
        Sign out
      </button>
    </div>
  );
}

export default function DashboardPlaceholder() {
  return (
    <AuthGuard stage="dashboard">
      <DashboardContent />
    </AuthGuard>
  );
}
