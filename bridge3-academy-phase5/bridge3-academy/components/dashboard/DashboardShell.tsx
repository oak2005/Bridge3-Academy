"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useProfile } from "@/lib/auth/useProfile";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Courses", href: "/dashboard/my-courses" },
  { label: "Workshops", href: "/dashboard/workshops" },
  { label: "Assessments", href: "/dashboard/assessments" },
  { label: "Portfolio", href: "/dashboard/portfolio" },
  { label: "Certification", href: "/dashboard/certification" },
  { label: "Community", href: "/dashboard/community" },
  { label: "Settings", href: "/dashboard/settings" },
];

function initialsFrom(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useProfile();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function signOut() {
    await supabaseBrowser.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-1px)]">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-paper-raised md:block">
        <div className="px-6 py-6">
          <Link href="/" className="font-display text-lg text-ink">
            Bridge3 Academy
          </Link>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-accent-tint text-ink" : "text-ink-soft hover:bg-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-paper-raised px-6 py-4">
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded border border-border"
            >
              <div className="flex flex-col gap-1">
                <span className="h-px w-5 bg-ink" />
                <span className="h-px w-5 bg-ink" />
                <span className="h-px w-5 bg-ink" />
              </div>
            </button>
            <p className="text-sm text-ink-muted">Bridge3 Academy</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotifOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded border border-border text-ink-soft hover:border-accent"
              >
                🔔
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded border border-border bg-paper-raised p-4 text-sm text-ink-muted shadow-sm">
                  No notifications yet.
                </div>
              )}
            </div>
            <Link
              href="/dashboard/settings"
              aria-label="Settings"
              className="flex h-9 w-9 items-center justify-center rounded border border-border text-ink-soft hover:border-accent"
            >
              ⚙
            </Link>
            <div className="flex items-center gap-2">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "Profile"}
                  className="h-9 w-9 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-accent-tint text-xs font-semibold text-ink">
                  {initialsFrom(profile?.full_name)}
                </div>
              )}
              <button
                type="button"
                onClick={signOut}
                className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:inline"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {mobileNavOpen && (
          <nav className="flex flex-col gap-1 border-b border-border bg-paper-raised px-3 py-3 md:hidden">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`rounded px-3 py-2 text-sm font-medium ${
                    active ? "bg-accent-tint text-ink" : "text-ink-soft"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={signOut}
              className="mt-1 rounded px-3 py-2 text-left text-sm font-medium text-ink-soft"
            >
              Sign out
            </button>
          </nav>
        )}

        <main className="flex-1 bg-paper">{children}</main>
      </div>
    </div>
  );
}
