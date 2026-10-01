"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

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
      "You've secured your place on the Bridge3 Academy waitlist. Completing the tasks on this dashboard earns priority onboarding, scholarship consideration, and direct placement into our upcoming cohorts.",
    badge: "1 of 5 • Welcome",
    icon: "🚀",
  },
  {
    id: "official-channels",
    targetSelector: '[data-tour="official-channel-task"]',
    title: "Follow Official Accounts 📢",
    description:
      "Follow our official X (Twitter) and Telegram community. Stay up to date on cohort launch dates, live AMAs, and Web3 resources. Enter your handle or link and submit for verification credit!",
    badge: "2 of 5 • Official Channels",
    icon: "📱",
  },
  {
    id: "progress",
    targetSelector: '[data-tour="waitlist-progress"]',
    title: "Live Verification Score 📈",
    description:
      "Watch this bar climb to 100%! Every verified task boosts your admission score, guaranteeing priority access as soon as student registration officially opens.",
    badge: "3 of 5 • Priority Score",
    icon: "⭐",
  },
  {
    id: "email-and-referrals",
    targetSelector: '[data-tour="waitlist-referral"]',
    title: "Invite Friends & Earn Bonus XP 🤝",
    description:
      "Copy your unique invite link and share it with fellow Web3 learners. Earn bonus XP for each friend who signs up and climb to the top of the Scholar Leaderboard!",
    badge: "4 of 5 • Invite & Earn",
    icon: "🎁",
  },
  {
    id: "video-tutorial",
    targetSelector: '[data-tour="waitlist-video-btn"]',
    title: "Step-by-Step Video Walkthrough 🎬",
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
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [forceOpen]);

  // Keep target rect updated on step changes, scroll, or resize
  useEffect(() => {
    if (!isOpen) return;

    const measure = () => {
      const step = WAITLIST_TOUR_STEPS[currentIndex];
      if (step?.targetSelector) {
        const el = document.querySelector(step.targetSelector);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
          return;
        }
      }
      setTargetRect(null);
    };

    const step = WAITLIST_TOUR_STEPS[currentIndex];
    if (step?.targetSelector) {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const timer = setTimeout(measure, 350);
        const secondTimer = setTimeout(measure, 700);
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure, true);
        return () => {
          clearTimeout(timer);
          clearTimeout(secondTimer);
          window.removeEventListener("resize", measure);
          window.removeEventListener("scroll", measure, true);
        };
      }
    }

    setTargetRect(null);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
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

  // Compute smart position for tour card so it never obscures the spotlighted element
  const cardStyle = useMemo<React.CSSProperties>(() => {
    if (!targetRect || typeof window === "undefined") {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "520px",
        width: "calc(100% - 32px)",
      };
    }

    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      if (spaceBelow >= 260) {
        return {
          position: "fixed",
          bottom: "16px",
          left: "16px",
          right: "16px",
          maxWidth: "calc(100% - 32px)",
        };
      }
      return {
        position: "fixed",
        top: "16px",
        left: "16px",
        right: "16px",
        maxWidth: "calc(100% - 32px)",
      };
    }

    // Desktop
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const cardWidth = 480;
    const clampedLeft = Math.max(cardWidth / 2 + 20, Math.min(window.innerWidth - cardWidth / 2 - 20, targetCenterX));

    if (spaceBelow >= 260 || spaceBelow >= spaceAbove) {
      // Place below
      const topPos = Math.min(window.innerHeight - 280, targetRect.bottom + 16);
      return {
        position: "fixed",
        top: `${topPos}px`,
        left: `${clampedLeft}px`,
        transform: "translateX(-50%)",
        width: "480px",
        maxWidth: "calc(100vw - 32px)",
      };
    } else {
      // Place above
      const bottomPos = window.innerHeight - targetRect.top + 16;
      return {
        position: "fixed",
        bottom: `${bottomPos}px`,
        left: `${clampedLeft}px`,
        transform: "translateX(-50%)",
        width: "480px",
        maxWidth: "calc(100vw - 32px)",
      };
    }
  }, [targetRect]);

  if (!isOpen) return null;

  const currentStep = WAITLIST_TOUR_STEPS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === WAITLIST_TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Target spotlight with crystal clear cutout */}
      {targetRect ? (
        <>
          {/* SVG Cutout Mask: rest of page is dark, element is 100% CLEAR and UNTOUCHED */}
          <svg className="fixed inset-0 h-full w-full pointer-events-auto" onClick={completeTour}>
            <defs>
              <mask id="waitlist-spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={Math.max(0, targetRect.left - 8)}
                  y={Math.max(0, targetRect.top - 8)}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="14"
                  ry="14"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.72)"
              mask="url(#waitlist-spotlight-mask)"
            />
          </svg>

          {/* Glowing Animated Spotlight Frame */}
          <div
            className="fixed pointer-events-none z-40 rounded-2xl border-2 border-accent shadow-[0_0_35px_rgba(238,107,31,0.65)] transition-all duration-300"
            style={{
              top: Math.max(0, targetRect.top - 8),
              left: Math.max(0, targetRect.left - 8),
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        </>
      ) : (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={completeTour}
        />
      )}

      {/* Floating Tour Modal Card */}
      <div
        style={cardStyle}
        className="z-50 rounded-2xl border border-border bg-paper-raised p-6 shadow-2xl transition-all duration-300 pointer-events-auto"
      >
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
