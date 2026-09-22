"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";
import { DEFAULT_SITE_SETTINGS } from "@/lib/settings/constants";

interface SettingsForm {
  logoText: string;
  logoUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroAnnouncement: string;
  illustrationUrl: string;
  illustrationCaption: string;
}

export default function SiteSettingsAdminPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [form, setForm] = useState<SettingsForm>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (profileLoading) return;
    if (profile && profile.role !== "admin") router.replace("/dashboard");
  }, [profile, profileLoading, router]);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    async function load() {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/admin/site-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setForm(data.settings);
        }
      }
      setLoading(false);
    }
    load();
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Site branding and hero settings saved successfully!" });
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: data.error || "Failed to save settings." });
      }
    } catch {
      setMessage({ type: "error", text: "Connection error while saving settings." });
    } finally {
      setSaving(false);
    }
  }

  if (profileLoading || loading) {
    return (
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="h-8 w-64 animate-pulse rounded bg-paper-raised" />
        <div className="mt-6 h-96 w-full animate-pulse rounded-xl bg-paper-raised border border-border" />
      </div>
    );
  }

  if (!profile || profile.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
        <Link href="/dashboard/mission-control" className="text-accent-hover hover:underline">
          ← Mission Control
        </Link>
        <span>/</span>
        <span className="text-ink">Site Branding & CMS</span>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">Site Branding & Hero CMS</h1>
          <p className="mt-1 text-xs text-ink-muted">
            Customize platform branding, hero typography, announcement messages, and upload the hero illustration slot.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`mt-6 rounded-lg p-4 text-xs font-semibold ${
            message.type === "success"
              ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border border-red-300 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {message.type === "success" ? "✓ " : "✕ "} {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Left Column: Form Controls */}
        <div className="space-y-6">
          {/* Logo Branding */}
          <div className="rounded-xl border border-border bg-paper-raised p-5 shadow-sm space-y-4">
            <h2 className="font-display text-base text-ink">1. Platform Logo Branding</h2>
            <div>
              <label className="block text-xs font-semibold text-ink-soft">Logo Display Text</label>
              <input
                type="text"
                value={form.logoText}
                onChange={(e) => setForm({ ...form, logoText: e.target.value })}
                placeholder="Bridge3 Academy"
                className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft">Logo Image URL (Optional)</label>
              <input
                type="url"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="https://.../logo.png (or SVG link)"
                className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-ink-muted">When provided, this replaces or accompanies the logo text in the header.</p>
            </div>
          </div>

          {/* Hero Section Texts */}
          <div className="rounded-xl border border-border bg-paper-raised p-5 shadow-sm space-y-4">
            <h2 className="font-display text-base text-ink">2. Homepage Hero Typography</h2>
            <div>
              <label className="block text-xs font-semibold text-ink-soft">Hero Headline</label>
              <textarea
                rows={2}
                value={form.heroHeadline}
                onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft">Hero Subheadline</label>
              <textarea
                rows={3}
                value={form.heroSubheadline}
                onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft">Primary CTA Button Label</label>
              <input
                type="text"
                value={form.heroCtaText}
                onChange={(e) => setForm({ ...form, heroCtaText: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft">Announcement / Priority Pill Text</label>
              <input
                type="text"
                value={form.heroAnnouncement}
                onChange={(e) => setForm({ ...form, heroAnnouncement: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Hero Illustration Slot */}
          <div className="rounded-xl border border-border bg-paper-raised p-5 shadow-sm space-y-4">
            <h2 className="font-display text-base text-ink">3. Hero Illustration Slot</h2>
            <p className="text-xs text-ink-muted">
              Replaces the dashed &quot;Illustration slot&quot; box on the homepage with an interactive Web3 illustration or image.
            </p>
            <div>
              <label className="block text-xs font-semibold text-ink-soft">Illustration / Graphic URL</label>
              <input
                type="url"
                value={form.illustrationUrl}
                onChange={(e) => setForm({ ...form, illustrationUrl: e.target.value })}
                placeholder="https://.../illustration.svg or .png"
                className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft">Illustration Caption / Alt Text</label>
              <input
                type="text"
                value={form.illustrationCaption}
                onChange={(e) => setForm({ ...form, illustrationCaption: e.target.value })}
                placeholder="Bridge3 Web3 Ecosystem"
                className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-accent px-5 py-3 text-xs font-bold text-accent-contrast shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {saving ? "Saving CMS Changes…" : "Save Site Settings & Publish"}
          </button>
        </div>

        {/* Right Column: Live Real-Time Preview */}
        <div>
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Live Homepage Preview</span>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">Real-time</span>
            </div>

            {/* Simulated Hero Card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-paper p-6 shadow-md">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logoUrl} alt="Logo" className="h-5 w-auto object-contain" />
                ) : null}
                <span className="font-display text-sm font-semibold text-ink">{form.logoText}</span>
              </div>

              <div className="mt-5 space-y-4">
                <h3 className="font-display text-xl sm:text-2xl leading-snug text-ink">{form.heroHeadline}</h3>
                <p className="text-xs leading-relaxed text-ink-soft">{form.heroSubheadline}</p>

                <div className="flex items-center gap-3 pt-2">
                  <div className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast shadow-sm">
                    {form.heroCtaText}
                  </div>
                </div>

                <p className="text-[11px] text-ink-muted italic">{form.heroAnnouncement}</p>

                {/* Illustration Slot Preview */}
                <div className="mt-4 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border border-border bg-paper-raised p-4">
                  {form.illustrationUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.illustrationUrl}
                      alt={form.illustrationCaption || "Hero illustration"}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <div className="h-10 w-10 rounded-full border border-dashed border-border flex items-center justify-center text-ink-muted">
                        ✦
                      </div>
                      <p className="mt-2 text-xs font-semibold text-ink-soft">Illustration slot</p>
                      <p className="text-[10px] text-ink-muted">Add an image or SVG URL to replace this placeholder</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
