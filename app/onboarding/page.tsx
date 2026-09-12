"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const TRACKS = [
  { value: "growth", label: "Growth" },
  { value: "creative", label: "Creative" },
  { value: "operations", label: "Operations" },
  { value: "engineering", label: "Engineering" },
];

function PersonalizationForm() {
  const router = useRouter();
  const { session } = useProfile();
  const [level, setLevel] = useState("");
  const [track, setTrack] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!level || !track || !session) {
      setError("Select both a level and a track to continue.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { error: updateError } = await supabaseBrowser
      .from("profiles")
      .update({ level, track, onboarding_completed: true })
      .eq("id", session.user.id);

    if (updateError) {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-content flex-col items-center px-6 py-24">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded border border-border bg-paper-raised p-8"
      >
        <h1 className="font-display text-2xl text-ink">Personalize your learning path</h1>
        <p className="mt-2 text-sm text-ink-muted">
          This shapes what shows up on your dashboard first.
        </p>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-ink-soft">Select level</legend>
          <div className="mt-2 flex flex-col gap-2">
            {LEVELS.map((l) => (
              <label
                key={l.value}
                className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm text-ink has-[:checked]:border-accent"
              >
                <input
                  type="radio"
                  name="level"
                  value={l.value}
                  checked={level === l.value}
                  onChange={(e) => setLevel(e.target.value)}
                />
                {l.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-ink-soft">Select track</legend>
          <div className="mt-2 flex flex-col gap-2">
            {TRACKS.map((t) => (
              <label
                key={t.value}
                className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm text-ink has-[:checked]:border-accent"
              >
                <input
                  type="radio"
                  name="track"
                  value={t.value}
                  checked={track === t.value}
                  onChange={(e) => setTrack(e.target.value)}
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full rounded bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Personalize my learning path"}
        </button>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGuard stage="onboarding">
      <PersonalizationForm />
    </AuthGuard>
  );
}
