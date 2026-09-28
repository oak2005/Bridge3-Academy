// Bridge3 Academy — XP rules.
// Change the numbers below to tune the economy; everything that displays
// XP (Portfolio, Leaderboard) reads from this one place.
export const XP_RULES = {
  lessonCompleted: 10,
  quizPassed: 25, // awarded once per quiz, not per retake
  assignmentSubmitted: 15, // awarded once per assignment, even if resubmitted
  assignmentApprovedBonus: 25, // ADDED on top of the submission XP once approved
  capstoneSubmitted: 20,
  capstoneApprovedBonus: 60, // ADDED on top of the submission XP once approved
  referralVerified: 20, // per verified invitee
  referralVerifiedCap: 25, // max invitees that count (max 500 XP)
} as const;

export interface StudentStats {
  lessonsCompleted: number;
  quizzesPassed: number; // distinct quizzes with a passing attempt
  assignmentsSubmitted: number; // distinct assignments with >=1 submission
  assignmentsApproved: number; // distinct assignments with an approved submission
  capstonesSubmitted: number; // distinct tracks with >=1 capstone submission
  capstonesApproved: number; // distinct tracks with an approved capstone
  currentStreak: number;
  anyTrackComplete: boolean;
  verifiedReferrals?: number; // count of confirmed waitlist referrals
}

export function calculateXP(stats: StudentStats): number {
  const referrals = Math.min(
    stats.verifiedReferrals || 0,
    XP_RULES.referralVerifiedCap
  );
  return (
    stats.lessonsCompleted * XP_RULES.lessonCompleted +
    stats.quizzesPassed * XP_RULES.quizPassed +
    stats.assignmentsSubmitted * XP_RULES.assignmentSubmitted +
    stats.assignmentsApproved * XP_RULES.assignmentApprovedBonus +
    stats.capstonesSubmitted * XP_RULES.capstoneSubmitted +
    stats.capstonesApproved * XP_RULES.capstoneApprovedBonus +
    referrals * XP_RULES.referralVerified
  );
}
