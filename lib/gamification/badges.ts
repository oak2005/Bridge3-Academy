import { StudentStats } from "./xp";

export interface BadgeDefinition {
  id: string;
  label: string;
  description: string;
  check: (stats: StudentStats) => boolean;
}

// Add or change badges here — every badge is a pure function over the same
// stats object the XP calculation uses, so there's one place to look for
// "why did/didn't this student earn X."
export const BADGES: BadgeDefinition[] = [
  {
    id: "first-lesson",
    label: "First Steps",
    description: "Completed your first lesson.",
    check: (s) => s.lessonsCompleted >= 1,
  },
  {
    id: "five-lessons",
    label: "Building Momentum",
    description: "Completed 5 lessons.",
    check: (s) => s.lessonsCompleted >= 5,
  },
  {
    id: "quiz-ace",
    label: "Quiz Ace",
    description: "Passed your first quiz.",
    check: (s) => s.quizzesPassed >= 1,
  },
  {
    id: "contributor",
    label: "Contributor",
    description: "Submitted your first assignment.",
    check: (s) => s.assignmentsSubmitted >= 1,
  },
  {
    id: "approved-work",
    label: "Approved Work",
    description: "Had an assignment approved by a mentor.",
    check: (s) => s.assignmentsApproved >= 1,
  },
  {
    id: "track-graduate",
    label: "Track Graduate",
    description: "Completed every requirement of a full track.",
    check: (s) => s.anyTrackComplete,
  },
  {
    id: "streak-3",
    label: "Streak Starter",
    description: "3-day activity streak.",
    check: (s) => s.currentStreak >= 3,
  },
  {
    id: "streak-7",
    label: "Consistent Learner",
    description: "7-day activity streak.",
    check: (s) => s.currentStreak >= 7,
  },
];
