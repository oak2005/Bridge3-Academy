"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

const ROLE_INTERESTS = [
  { value: "developer", label: "Developer" },
  { value: "growth", label: "Growth" },
  { value: "creative", label: "Creative" },
  { value: "operations", label: "Operations" },
];

function ProfileForm() {
  const router = useRouter();
  const { session } = useProfile();
  const [university, setUniversity] = useState("");
  const [roleInterest, setRoleInterest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!university || !roleInterest || !session) {
      setError("Fill in both fields to continue.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { error: updateError } = await supabaseBrowser
      .from("profiles")
      .update({ university, role_interest: roleInterest })
      .eq("id", session.user.id);

    if (updateError) {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
      return;
    }

    router.replace("/onboarding");
  }

  return (
    <div className="mx-auto flex max-w-content flex-col items-center px-6 py-24">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded border border-border bg-paper-raised p-8"
      >
        <h1 className="font-display text-2xl text-ink">A couple more details</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Google doesn&rsquo;t share this with us, so we need it directly.
        </p>

        <label className="mt-6 block text-sm font-medium text-ink-soft">
          University
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent"
            placeholder="e.g. University of Lagos"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-ink-soft">
          Role interest
          <select
            value={roleInterest}
            onChange={(e) => setRoleInterest(e.target.value)}
            className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent"
          >
            <option value="">Select one</option>
            {ROLE_INTERESTS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full rounded bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

export default function ProfileOnboardingPage() {
  return (
    <AuthGuard stage="profile">
      <ProfileForm />
    </AuthGuard>
  );
}
