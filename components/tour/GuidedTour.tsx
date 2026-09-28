"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export interface TourStep {
  id: string;
  targetSelector?: string;
  title: string;
  description: string;
  badge?: string;
  icon?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Bridge3 Academy! 🚀",
    description:
      "Your structured, hands-on gateway to Web3 education across Africa. Learn smart contracts, build on Bitcoin, and earn verified on-chain credentials.",
    badge: "Orientation",
    icon: "🎓",
  },
  {
    id: "today-lesson",
    targetSelector: '[data-tour="today-lesson"]',
    title: "Today's Lesson & Quick Resume",
    description:
      "Pick up exactly where you left off. This card always points you to the very next lesson, quiz, or workshop in your active curriculum.",
    badge: "Learning Flow",
    icon: "📖",
  },
  {
    id: "tracks",
    targetSelector: '[data-tour="my-courses"]',
    title: "Structured Learning Tracks",
    description:
      "Explore our General Track and specialized ecosystems. Each track is divided into bite-sized modules, video lessons, and interactive challenges.",
    badge: "Curriculum",
    icon: "🗺️",
  },
  {
    id: "video-listen",
    targetSelector: '[data-tour="classroom"]',
    title: "Watch, Read, or Listen with AI Audio",
    description:
      "Every lesson features high-definition video walkthroughs and full notes. Prefer audio on the go? Use the Listen toggle with speed controls and speech narration!",
    badge: "Multi-Modal",
    icon: "🎧",
  },
  {
    id: "navigation",
    targetSelector: '[data-tour="sequence-nav"]',
    title: "Seamless Step-by-Step Navigation",
    description:
      "No more wondering what to do next. Hit 'Complete & Continue' to seamlessly proceed from lessons to quizzes and assignments across the track.",
    badge: "Navigation",
    icon: "➡️",
  },
  {
    id: "assessments",
    targetSelector: '[data-tour="assessments"]',
    title: "Interactive Quizzes & Mastery Checks",
    description:
      "Test your knowledge with instant server-graded quizzes at the end of each module. Earn XP upon passing and unlock subsequent content.",
    badge: "Assessments",
    icon: "✅",
  },
  {
    id: "workshops",
    targetSelector: '[data-tour="workshops"]',
    title: "Hands-on Workshops & Capstones",
    description:
      "Build real projects, submit your code or repositories, and receive detailed personalized feedback from experienced mentors.",
    badge: "Proof of Work",
    icon: "🛠️",
  },
  {
    id: "tools",
    targetSelector: '[data-tour="tools"]',
    title: "Web3 Tools & Ecosystem Directory",
    description:
      "Access curated wallets (Leather, Xverse), African exchanges (Luno, Quidax), block explorers, and Clarity playgrounds tailored for students.",
    badge: "Ecosystem",
    icon: "🧰",
  },
  {
    id: "xp-streak",
    targetSelector: '[data-tour="xp-streak"]',
    title: "XP Economy, Badges & Daily Streaks",
    description:
      "Earn XP for every lesson, quiz, assignment, and verified invite. Keep your daily streak alive to earn exclusive achievement badges.",
    badge: "Gamification",
    icon: "⚡",
  },
  {
    id: "portfolio",
    targetSelector: '[data-tour="portfolio"]',
    title: "Your Public Web3 Portfolio",
    description:
      "Showcase your completed tracks, badges, earned XP, and capstone projects to employers and hackathon organizers with a public shareable URL.",
    badge: "Proof of Skill",
    icon: "🌟",
  },
  {
    id: "certification",
    targetSelector: '[data-tour="certification"]',
    title: "Verifiable Certificates",
    description:
      "Complete a full track to generate a cryptographically verifiable completion certificate with unique verification hash.",
    badge: "Credentials",
    icon: "📜",
  },
  {
    id: "community",
    targetSelector: '[data-tour="community"]',
    title: "Community & Peer Learning",
    description:
      "Join our official Telegram and Discord channels to collaborate with fellow scholars, ask questions, and attend live AMAs.",
    badge: "Community",
    icon: "🌍",
  },
];

interface GuidedTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
  userCompletedTour?: boolean;
}

export function GuidedTour({ forceOpen = false, onClose, userCompletedTour = false }: GuidedTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // If explicitly opened
    if (forceOpen) {
      setIsOpen(true);
      setCurrentIndex(0);
      return;
    }

    // Auto-open on first visit if not yet completed
    if (typeof window !== "undefined") {
      const localDone = localStorage.getItem("b3a_tour_completed") === "true";
      if (!localDone && !userCompletedTour) {
        // Small delay so page elements render
        const t = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(t);
      }
    }
  }, [forceOpen, userCompletedTour]);

  // Track target element bounding rectangle for highlight
  useEffect(() => {
    if (!isOpen) return;
    const step = TOUR_STEPS[currentIndex];
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

  const completeTour = useCallback(async () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("b3a_tour_completed", "true");
    }

    try {
      const { data } = await supabaseBrowser.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        await fetch("/api/tour/complete", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Failed to mark tour completed:", err);
    }

    if (onClose) onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (currentIndex < TOUR_STEPS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      completeTour();
    }
  }, [currentIndex, completeTour]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
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

  const currentStep = TOUR_STEPS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={completeTour}
      />

      {/* Target highlight ring if target found */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-xl border-2 border-accent shadow-[0_0_25px_rgba(238,107,31,0.5)] transition-all duration-300"
          style={{
            top: Math.max(0, targetRect.top - 6),
            left: Math.max(0, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Tour Card Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-paper-raised p-6 shadow-2xl transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentStep.icon || "💡"}</span>
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
              {currentStep.badge || `Step ${currentIndex + 1} of ${TOUR_STEPS.length}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              target="_blank"
              className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
            >
              <span>📺</span>
              <span>Watch Demo</span>
            </Link>
            <button
              type="button"
              onClick={completeTour}
              className="text-xs text-ink-muted hover:text-ink transition-colors"
            >
              ✕ Skip
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          <h3 className="font-display text-lg font-bold text-ink">{currentStep.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {currentStep.description}
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === i ? "w-6 bg-accent" : "w-2 bg-border hover:bg-ink-muted"
                }`}
                title={`Go to step ${i + 1}`}
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
              {isLast ? "Get Started! 🚀" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
