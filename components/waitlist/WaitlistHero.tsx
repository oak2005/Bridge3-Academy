"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CHECKLIST_PREVIEW = [
  "Join Telegram community",
  "Follow X (Twitter)",
  "Share with 3 friends",
  "Confirm email",
];

export function WaitlistHero() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [signupId, setSignupId] = useState<string | null>(null);

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
            Africa&rsquo;s first structured Web3 education Platform.
          </h1>
          <p className="mt-4 max-w-prose text-ink-soft">
            From zero knowledge to verified certification. Learn blockchain, DeFi,
            smart contracts, and career-ready Web3 skills without tutorial chaos.
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
              {status === "submitting" ? "Joining…" : "Join Early Access"}
            </button>
          </form>

          {status === "error" && (
            <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
          )}

          <p className="mt-3 text-sm text-ink-muted">
            Early members receive priority verification and scholarship
            consideration.
          </p>
        </div>

        <div className="flex aspect-[4/3] items-center justify-center rounded border border-dashed border-border bg-paper-raised">
          <p className="text-sm text-ink-muted">Illustration slot</p>
        </div>
      </div>

      {signupId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 px-6"
        >
          <div className="w-full max-w-md rounded-md border border-border bg-paper-raised p-8">
            <h2 className="font-display text-2xl text-ink">You&rsquo;re on the list</h2>
            <p className="mt-2 text-sm text-ink-soft">
              To increase your verification priority and secure early access,
              complete the onboarding tasks below.
            </p>

            <ul className="mt-6 flex flex-col gap-2">
              {CHECKLIST_PREVIEW.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs text-ink-muted">
              Your verification score increases as you complete tasks.
            </p>

            <button
              type="button"
              onClick={goToDashboard}
              className="mt-6 w-full rounded bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              Go to Verification Tasks Dashboard
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
