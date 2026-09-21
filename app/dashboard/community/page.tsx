"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/lib/auth/useProfile";
import { supabaseBrowser } from "@/lib/supabase/client";

interface Announcement {
  id: string;
  author_id: string | null;
  authorName: string;
  title: string;
  content: string;
  category: "general" | "workshop" | "hackathon" | "ama" | "update";
  pinned: boolean;
  created_at: string;
}

const OFFICIAL_CHANNELS = [
  {
    name: "Telegram Community",
    description: "Daily discussions, troubleshooting, and collaboration with fellow African Web3 students.",
    url: "https://t.me/Bridge3Academy",
    icon: "💬",
    badge: "Active",
  },
  {
    name: "Telegram Announcements",
    description: "Official drops, new track releases, milestone deadlines, and urgent platform notices.",
    url: "https://t.me/Bridge3Academy",
    icon: "📢",
    badge: "Official",
  },
  {
    name: "X (Twitter) @Bridge3Academy",
    description: "Weekly Spaces, community spotlights, graduate showcases, and ecosystem news.",
    url: "https://x.com/Bridge3Academy",
    icon: "🐦",
    badge: "Weekly Spaces",
  },
  {
    name: "Discord Server",
    description: "Clarity code help, Clarinet CLI debugging channels, and voice study rooms.",
    url: "https://discord.com",
    icon: "🎮",
    badge: "Builder Hub",
  },
  {
    name: "Stacks Africa Forum",
    description: "Ecosystem governance, SIP discussions, grant opportunities, and regional initiatives.",
    url: "https://forum.stacks.org",
    icon: "🌍",
    badge: "Ecosystem",
  },
];

const STUDY_CIRCLES = [
  {
    name: "Bitcoin & Stacks Foundations",
    focus: "Proof of Transfer (PoX), sBTC, wallet setup (Leather, Xverse), and BTCFi mechanics.",
    members: "140+ Scholars",
    icon: "🪙",
  },
  {
    name: "Clarity & Smart Contracts",
    focus: "Writing decidable smart contracts, Clarinet unit tests, and Testnet contract deployment.",
    members: "95+ Builders",
    icon: "⚡",
  },
  {
    name: "Creators & Digital Assets",
    focus: "SIP-009 NFT standards, creator royalties, tokenomics, and cultural storytelling.",
    members: "80+ Creators",
    icon: "🎨",
  },
  {
    name: "Growth & Community Operations",
    focus: "DAO coordination, onboarding strategies, campus ambassadors, and event organizing.",
    members: "110+ Operators",
    icon: "📈",
  },
];

function categoryColor(category: Announcement["category"]) {
  switch (category) {
    case "workshop":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
    case "hackathon":
      return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
    case "ama":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    case "update":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default function CommunityPage() {
  const { profile } = useProfile();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // New announcement modal (mentor / admin only)
  const [showPostModal, setShowPostModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Announcement["category"]>("general");
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const isMentorOrAdmin = profile?.role === "mentor" || profile?.role === "admin";

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/community/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch {
      // Best-effort
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setPostError(null);

    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setPostError("Not signed in.");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/community/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, category, pinned }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setPostError(errData.error || "Failed to post announcement.");
        setSubmitting(false);
        return;
      }

      setTitle("");
      setContent("");
      setPinned(false);
      setShowPostModal(false);
      await fetchAnnouncements();
    } catch {
      setPostError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">Community &amp; Ecosystem</h1>
          <p className="mt-2 max-w-prose text-sm text-ink-muted leading-relaxed">
            Connect with peer builders across Africa, join study circles, attend weekly live technical sessions, and collaborate with mentors.
          </p>
        </div>

        {isMentorOrAdmin && (
          <button
            type="button"
            onClick={() => setShowPostModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast transition-colors hover:bg-accent-hover shadow-sm"
          >
            + Post Announcement
          </button>
        )}
      </div>

      {/* Post Modal for Mentors/Admins */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border border-border bg-paper-raised p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-base font-semibold text-ink">Post Announcement</h3>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="text-ink-muted hover:text-ink text-sm"
              >
                ✕
              </button>
            </div>

            {postError && (
              <p className="mt-3 text-xs text-red-600 dark:text-red-400 font-medium">{postError}</p>
            )}

            <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clarity Hackathon Demo Day Schedule"
                  required
                  className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Announcement["category"])}
                  className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                >
                  <option value="general">General</option>
                  <option value="workshop">Workshop</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="ama">AMA / Space</option>
                  <option value="update">Platform Update</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink">Content</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write announcement details..."
                  required
                  className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="pin" className="text-xs text-ink-muted cursor-pointer">
                  Pin to top of feed 📌
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="rounded border border-border px-3 py-1.5 text-xs text-ink-muted hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-accent px-4 py-1.5 text-xs font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section 1: Official Channels Grid */}
      <div className="mt-8">
        <h2 className="font-display text-base font-semibold text-ink">Official Channels</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {OFFICIAL_CHANNELS.map((channel) => (
            <a
              key={channel.name}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between rounded-xl border border-border bg-paper-raised p-4 transition-all hover:border-accent hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{channel.icon}</span>
                  <span className="rounded-full bg-accent-tint px-2 py-0.5 text-[10px] font-semibold text-ink">
                    {channel.badge}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-bold text-ink">{channel.name}</h3>
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">{channel.description}</p>
              </div>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-accent-hover">
                Join Channel ↗
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Section 2: Announcements Board */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">Platform Announcements</h2>
          <span className="text-xs text-ink-muted">Live from mentors &amp; leadership</span>
        </div>

        <div className="mt-3 space-y-3">
          {loadingAnnouncements ? (
            <div className="space-y-3">
              <div className="h-24 w-full animate-pulse rounded-xl border border-border bg-paper-raised" />
              <div className="h-24 w-full animate-pulse rounded-xl border border-border bg-paper-raised" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-ink-muted">
              No announcements published yet.
            </div>
          ) : (
            announcements.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-colors ${
                  item.pinned
                    ? "border-accent/50 bg-accent-tint/20 dark:bg-accent-tint/10"
                    : "border-border bg-paper-raised"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {item.pinned && (
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                        📌 Pinned
                      </span>
                    )}
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-ink">{item.title}</span>
                  </div>
                  <span className="text-[11px] text-ink-muted shrink-0">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-2 text-xs text-ink-muted leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
                <p className="mt-2 text-[11px] text-ink-soft">
                  Posted by <span className="font-medium">{item.authorName}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 3: Study Circles */}
      <div className="mt-12">
        <h2 className="font-display text-base font-semibold text-ink">Track Study Circles</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Connect with other students actively working through the same modules.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {STUDY_CIRCLES.map((circle) => (
            <div
              key={circle.name}
              className="flex items-start gap-3 rounded-xl border border-border bg-paper-raised p-4"
            >
              <span className="text-2xl mt-0.5">{circle.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-ink">{circle.name}</h3>
                  <span className="rounded bg-paper px-1.5 py-0.5 text-[10px] font-medium text-ink-muted border border-border">
                    {circle.members}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">{circle.focus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Weekly Live Schedule */}
      <div className="mt-12 rounded-xl border border-border bg-paper-raised p-5">
        <h2 className="font-display text-base font-semibold text-ink">Weekly Community Schedule</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-lg border border-border/60 bg-paper p-3">
            <p className="font-bold text-ink">Thursday · 6:00 PM UTC</p>
            <p className="mt-0.5 text-accent font-medium">Clarity Walkthrough &amp; Clarinet Debugging</p>
            <p className="mt-1 text-ink-muted">
              Live code reviews on X Spaces and voice stage with community mentors.
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-paper p-3">
            <p className="font-bold text-ink">Saturday · 4:00 PM UTC</p>
            <p className="mt-0.5 text-emerald-700 dark:text-emerald-300 font-medium">
              Peer Project Review &amp; Capstone Office Hours
            </p>
            <p className="mt-1 text-ink-muted">
              Get feedback on your assignment submissions before mentor sign-off.
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Code of Conduct */}
      <div className="mt-10 border-t border-border pt-6 text-xs text-ink-muted leading-relaxed">
        <p className="font-semibold text-ink mb-1">Bridge3 Academy Community Guidelines</p>
        <p>
          We are committed to fostering an inclusive, welcoming environment for African developers and creators entering the Bitcoin &amp; Stacks ecosystem. Respect peers, provide constructive feedback on workshop submissions, and never share answers to assessments.
        </p>
      </div>
    </div>
  );
}
