/**
 * Computes a consecutive-day activity streak from a list of ISO
 * timestamps. Dates are compared in UTC for simplicity — a streak might
 * be off by one day right around midnight depending on the student's own
 * timezone, which is an acceptable simplification for now.
 */
export function computeStreak(activityTimestamps: string[]): number {
  if (activityTimestamps.length === 0) return 0;

  const uniqueDates = Array.from(
    new Set(activityTimestamps.map((ts) => ts.slice(0, 10))) // "YYYY-MM-DD"
  ).sort((a, b) => (a < b ? 1 : -1)); // descending, most recent first

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // If there's no activity today or yesterday, the streak is broken (0),
  // even if there was a long streak further in the past.
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]).getTime();
    const next = new Date(uniqueDates[i + 1]).getTime();
    const dayDiff = Math.round((current - next) / 86400000);
    if (dayDiff === 1) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
