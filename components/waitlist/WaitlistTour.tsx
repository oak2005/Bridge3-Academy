"use client";

import { useState, useEffect, useCallback } from "react";

export interface WaitlistTourStep {
  id: string;
  targetSelector?: string;
  title: string;
  description: string;
  badge?: string;
  icon?: string;
}

export const WAITLIST_TOUR_STEPS: WaitlistTourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Early Scholar Verification! 🎓",
    description:
      "You've secured your place on the Bridge3 Academy waitlist. Complete the tasks on this dashboard to earn priority onboarding, scholarship consideration, and private cohort placement.",
    badge: "1 of 5 • Overview",
    icon: "🚀",
  },
  {
    id: "official-channels",
    targetSelector: '[data-tour="waitlist-tasks"]',
    title: "Follow Official Accounts & Channels 📢",
    description:
      "Join our official Telegram community and follow our X (Twitter) channel. Stay updated on cohort schedules, live AMAs, and Web3 curriculum drops. Submit your handle or proof to earn verification points!",
    badge: "2 of 5 • Official Channels",
    icon: "📱",
  },
  {
    id: "progress",
    targetSelector: '[data-tour="waitlist-progress"]',
    title: "Verification Score & Priority Rank 📈",
    description:
      "Watch this bar climb to 100%! Each completed task is reviewed and verified by the Academy team, boosting your early admissions rank when student enrollment officially opens.",
    badge: "3 of 5 • Priority Score",
    icon: "⭐",
  },
  {
    id: "email-and-referrals",
    targetSelector: '[data-tour="waitlist-referral"]',
    title: "Confirm Email & Invite Peers 🤝",
    description:
      "Confirm your email address for instant verification credit, and copy your personal referral link to invite fellow builders. Top inviters gain bonus XP and featured placement on the Leaderboard!",
    badge: "4 of 5 • Boost & Earn",
    icon: "🎁",
  },
  {
    id: "video-tutorial",
    targetSelector: '[data-tour="waitlist-video-btn"]',
    title: "Step-by-Step Video Demonstration 🎬",
    description:
      "Prefer visual guidance? You can click 'Watch Step-by-Step Video Tutorial' or relaunch this Interactive Walkthrough at any time.",
    badge: "5 of 5 • Visual Help",
    icon: "💡",
  },
];

interface WaitlistTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function WaitlistTour({ forceOpen = false, onClose }: WaitlistTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentIndex(0);
      return;
    }

    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("b3a_waitlist_tour_seen") === "true";
      if (!seen) {
        const timer = setTimeout(() => setIsOpen(true), 700);
        return () => clearTimeout(timer);
      }
    }
  }, [forceOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const step = WAITLIST_TOUR_STEPS[currentIndex];
    if (step.targetSelector) {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    setTargetRect(null);
  }, [isOpen, currentIndex]);

  const completeTour = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("b3a_waitlist_tour_seen", "true");
    }
    if (onClose) onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (currentIndex < WAITLIST_TOUR_STEPS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      completeTour();
    }
  }, [currentIndex, completeTour]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") completeTour();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, completeTour, handleNext, handlePrev]);

  if (!isOpen) return null;

  const currentStep = WAITLIST_TOUR_STEPS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === WAITLIST_TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={completeTour}
      />

      {/* Target highlight ring */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-xl border-2 border-accent shadow-[0_0_30px_rgba(238,107,31,0.55)] transition-all duration-300"
          style={{
            top: Math.max(0, targetRect.top - 8),
            left: Math.max(0, targetRect.left - 8),
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-paper-raised p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentStep.icon || "🧭"}</span>
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent border border-accent/20">
              {currentStep.badge || `Step ${currentIndex + 1} of ${WAITLIST_TOUR_STEPS.length}`}
            </span>
          </div>

          <button
            type="button"
            onClick={completeTour}
            className="text-xs text-ink-muted hover:text-ink transition-colors"
          >
            ✕ Skip Walkthrough
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          <h3 className="font-display text-lg font-bold text-ink">{currentStep.title}</h3>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-soft">
            {currentStep.description}
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {WAITLIST_TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === i ? "w-6 bg-accent" : "w-2 bg-border hover:bg-ink-muted"
                }`}
                title={`Step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-paper"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-accent-contrast hover:bg-accent-hover transition-colors shadow-sm"
            >
              {isLast ? "Ready to Start! 🚀" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
