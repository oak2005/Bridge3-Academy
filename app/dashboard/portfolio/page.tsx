"use client";

import { useEffect, useState, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";
import { computeStudentStats } from "@/lib/gamification/computeStudentStats";
import { calculateXP, StudentStats } from "@/lib/gamification/xp";
import { BADGES } from "@/lib/gamification/badges";

interface PortfolioLink {
  id: string;
  label: string;
  url: string;
}

export default function PortfolioPage() {
  const { session } = useProfile();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [links, setLinks] = useState<PortfolioLink[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [savingLink, setSavingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadLinks = useCallback(async () => {
    if (!session) return;
    const { data } = await supabaseBrowser
      .from("portfolio_links")
      .select("id, label, url")
      .eq("student_id", session.user.id)
      .order("order_index", { ascending: true });
    setLinks(data || []);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const s = await computeStudentStats(supabaseBrowser, session.user.id);
      setStats(s);
      await loadLinks();
      setLoading(false);
    })();
  }, [session, loadLinks]);

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !newLabel || !newUrl) return;
    setSavingLink(true);
    await supabaseBrowser.from("portfolio_links").insert({
      student_id: session.user.id,
      label: newLabel,
      url: newUrl,
      order_index: links.length,
    });
    setNewLabel("");
    setNewUrl("");
    await loadLinks();
    setSavingLink(false);
  }

  async function removeLink(id: string) {
    await supabaseBrowser.from("portfolio_links").delete().eq("id", id);
    await loadLinks();
  }

  function shareProfile() {
    if (!session) return;
    const url = `${window.location.origin}/portfolio/${session.user.id}`;
    if (navigator.share) {
      navigator.share({ title: "My Bridge3 Academy Portfolio", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading || !stats || !session) {
    return <p className="px-6 py-12 text-ink-muted">Loading your portfolio…</p>;
  }

  const xp = calculateXP(stats);
  const earned = BADGES.filter((b) => b.check(stats));
  const locked = BADGES.filter((b) => !b.check(stats));

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Portfolio</h1>
        <button
          type="button"
          onClick={shareProfile}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
        >
          {copied ? "Link copied!" : "Share public profile"}
        </button>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div className="rounded border border-border bg-paper-raised p-6 text-center">
          <p className="font-display text-3xl text-ink">{xp}</p>
          <p className="mt-1 text-sm text-ink-muted">Total XP</p>
        </div>
        <div className="rounded border border-border bg-paper-raised p-6 text-center">
          <p className="font-display text-3xl text-ink">{stats.currentStreak}</p>
          <p className="mt-1 text-sm text-ink-muted">Day streak</p>
        </div>
        <div className="rounded border border-border bg-paper-raised p-6 text-center">
          <p className="font-display text-3xl text-ink">{earned.length}</p>
          <p className="mt-1 text-sm text-ink-muted">Badges earned</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl text-ink">Badges</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {earned.map((b) => (
          <div key={b.id} className="rounded border border-accent bg-accent-tint p-4">
            <p className="text-sm font-semibold text-ink">🏅 {b.label}</p>
            <p className="mt-1 text-xs text-ink-soft">{b.description}</p>
          </div>
        ))}
        {locked.map((b) => (
          <div key={b.id} className="rounded border border-dashed border-border p-4 opacity-60">
            <p className="text-sm font-semibold text-ink-muted">🔒 {b.label}</p>
            <p className="mt-1 text-xs text-ink-muted">{b.description}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl text-ink">Proof-of-work links</h2>
      <p className="mt-1 text-sm text-ink-muted">
        These appear on your public portfolio — add anything you&rsquo;d want an
        employer or ecosystem partner to see.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.id} className="flex items-center justify-between rounded border border-border bg-paper-raised px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">{l.label}</p>
              <a href={l.url} target="_blank" rel="noreferrer" className="text-xs text-accent-hover underline">
                {l.url}
              </a>
            </div>
            <button
              type="button"
              onClick={() => removeLink(l.id)}
              className="text-xs text-ink-muted hover:text-red-700"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addLink} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Label (e.g. GitHub)"
          className="rounded border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent sm:w-48"
        />
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://…"
          className="flex-1 rounded border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent"
        />
        <button
          type="submit"
          disabled={savingLink || !newLabel || !newUrl}
          className="rounded border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:border-accent disabled:opacity-60"
        >
          {savingLink ? "Adding…" : "Add link"}
        </button>
      </form>
    </div>
  );
}
