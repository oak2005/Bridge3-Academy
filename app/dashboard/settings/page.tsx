"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile, Profile } from "@/lib/auth/useProfile";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useTheme } from "@/lib/theme/ThemeContext";

export default function SettingsPage() {
  const router = useRouter();
  const { session, profile, loading: profileLoading, refresh } = useProfile();
  const { theme, setTheme } = useTheme();

  // Form states
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [roleInterest, setRoleInterest] = useState<Profile["role_interest"]>(null);
  const [track, setTrack] = useState<Profile["track"]>(null);
  const [level, setLevel] = useState<Profile["level"]>(null);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Notification toggles
  const [notifyMentorReviews, setNotifyMentorReviews] = useState(true);
  const [notifyCertificates, setNotifyCertificates] = useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] = useState(true);
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setUniversity(profile.university || "");
      setRoleInterest(profile.role_interest || null);
      setTrack(profile.track || null);
      setLevel(profile.level || null);
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setErrorMessage("Not signed in.");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          university,
          role_interest: roleInterest,
          track,
          level,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update profile.");
      } else {
        setSuccessMessage("Profile updated successfully!");
        await refresh();
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = () => {
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 2500);
  };

  const handleSignOut = async () => {
    await supabaseBrowser.auth.signOut();
    router.replace("/login");
  };

  if (profileLoading) {
    return (
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="h-8 w-40 animate-pulse rounded bg-paper-raised" />
        <div className="mt-4 h-4 w-80 animate-pulse rounded bg-paper-raised" />
        <div className="mt-8 space-y-6">
          <div className="h-64 w-full animate-pulse rounded-xl border border-border bg-paper-raised" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-ink">Account &amp; Settings</h1>
        <p className="mt-2 max-w-prose text-sm text-ink-muted leading-relaxed">
          Manage your student profile details, track preferences, notification alerts, and account access.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          ✓ {successMessage}
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          ✕ {errorMessage}
        </div>
      )}

      {/* Section 1: Profile Information */}
      <div className="mt-8 rounded-xl border border-border bg-paper-raised p-6 shadow-sm">
        <h2 className="font-display text-base font-semibold text-ink">Personal Profile</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Your name appears on your public portfolio, verified certificates, and peer discussion comments.
        </p>

        <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-ink">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink">University / Institute</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. University of Lagos, Makerere, KNUST"
                className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-ink">Primary Track</label>
              <select
                value={track || ""}
                onChange={(e) => setTrack((e.target.value as Profile["track"]) || null)}
                className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent"
              >
                <option value="">Select track...</option>
                <option value="engineering">Developer / Clarity</option>
                <option value="creative">Creator / Designer</option>
                <option value="growth">Community &amp; Growth</option>
                <option value="operations">Operations &amp; Ecosystem</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink">Experience Level</label>
              <select
                value={level || ""}
                onChange={(e) => setLevel((e.target.value as Profile["level"]) || null)}
                className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent"
              >
                <option value="">Select level...</option>
                <option value="beginner">Beginner (New to Web3)</option>
                <option value="intermediate">Intermediate (Familiar with crypto)</option>
                <option value="advanced">Advanced (Active builder / developer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink">Role Interest</label>
              <select
                value={roleInterest || ""}
                onChange={(e) => setRoleInterest((e.target.value as Profile["role_interest"]) || null)}
                className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent"
              >
                <option value="">Select interest...</option>
                <option value="developer">Developer</option>
                <option value="growth">Growth</option>
                <option value="creative">Creative</option>
                <option value="operations">Operations</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-xs font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Account Overview */}
      <div className="mt-8 rounded-xl border border-border bg-paper-raised p-6 shadow-sm">
        <h2 className="font-display text-base font-semibold text-ink">Account Credentials</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Authenticated with Google OAuth. Your email address is protected and never shared publicly.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-lg border border-border bg-paper p-3">
            <p className="text-ink-muted">Email</p>
            <p className="mt-0.5 font-medium text-ink truncate">{session?.user?.email || "Signed In"}</p>
          </div>
          <div className="rounded-lg border border-border bg-paper p-3">
            <p className="text-ink-muted">Platform Role</p>
            <p className="mt-0.5 font-bold uppercase tracking-wider text-accent">
              {profile?.role || "student"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-paper p-3">
            <p className="text-ink-muted">Account Status</p>
            <p className="mt-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
              Active Scholar
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Appearance & Theme */}
      <div className="mt-8 rounded-xl border border-border bg-paper-raised p-6 shadow-sm">
        <h2 className="font-display text-base font-semibold text-ink">Appearance &amp; Theme</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Customize how Bridge3 Academy looks on your device. Choose between light, dark, or system preference.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              theme === "light"
                ? "border-accent bg-accent-tint/40 shadow-sm"
                : "border-border bg-paper hover:bg-paper-hover"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 text-lg">
              ☀️
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Light Mode</p>
              <p className="text-[11px] text-ink-muted">Cool bone canvas &amp; dark text</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              theme === "dark"
                ? "border-accent bg-accent-tint/40 shadow-sm"
                : "border-border bg-paper hover:bg-paper-hover"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 text-lg">
              🌙
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Dark Mode</p>
              <p className="text-[11px] text-ink-muted">Deep obsidian &amp; crisp sage</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              theme === "system"
                ? "border-accent bg-accent-tint/40 shadow-sm"
                : "border-border bg-paper hover:bg-paper-hover"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper-raised text-ink text-lg border border-border">
              💻
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">System Default</p>
              <p className="text-[11px] text-ink-muted">Matches your OS setting</p>
            </div>
          </button>
        </div>
      </div>

      {/* Section 4: Notification Preferences */}
      <div className="mt-8 rounded-xl border border-border bg-paper-raised p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">In-App Alerts &amp; Notifications</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Choose which events trigger notification bell alerts in your dashboard.
            </p>
          </div>
          {preferencesSaved && (
            <span className="text-xs font-semibold text-emerald-600">Preferences Saved ✓</span>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between rounded-lg border border-border bg-paper p-3 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-ink">Mentor Feedback &amp; Approvals</p>
              <p className="text-[11px] text-ink-muted">
                Receive instant alerts when a mentor reviews your workshop or capstone submission.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyMentorReviews}
              onChange={(e) => {
                setNotifyMentorReviews(e.target.checked);
                handleSavePreferences();
              }}
              className="rounded border-border text-accent focus:ring-accent"
            />
          </label>

          <label className="flex items-center justify-between rounded-lg border border-border bg-paper p-3 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-ink">Certificate Achievements</p>
              <p className="text-[11px] text-ink-muted">
                Get notified when you complete track criteria and certificates are unlocked.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyCertificates}
              onChange={(e) => {
                setNotifyCertificates(e.target.checked);
                handleSavePreferences();
              }}
              className="rounded border-border text-accent focus:ring-accent"
            />
          </label>

          <label className="flex items-center justify-between rounded-lg border border-border bg-paper p-3 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-ink">Community Announcements &amp; Live Events</p>
              <p className="text-[11px] text-ink-muted">
                Alerts when mentors announce new X Spaces, Clarity workshops, and hackathons.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyAnnouncements}
              onChange={(e) => {
                setNotifyAnnouncements(e.target.checked);
                handleSavePreferences();
              }}
              className="rounded border-border text-accent focus:ring-accent"
            />
          </label>
        </div>
      </div>

      {/* Section 4: Sign Out */}
      <div className="mt-8 rounded-xl border border-border bg-paper-raised p-6 shadow-sm">
        <h2 className="font-display text-base font-semibold text-ink">Session Management</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Sign out of this browser. Your progress, XP, and submitted assignments will remain saved.
        </p>

        <div className="mt-4 flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-300 transition-colors hover:bg-red-100"
          >
            Sign Out of Bridge3 Academy
          </button>
          <span className="text-[11px] text-ink-muted">
            Bridge3 Academy v0.1.0 · Stacks Ecosystem
          </span>
        </div>
      </div>
    </div>
  );
}
