"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { supabaseBrowser } from "@/lib/supabase/client";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Curriculum", href: "/#curriculum" },
  { label: "Tracks", href: "/#tracks" },
  { label: "Docs", href: "/docs" },
  { label: "FAQs", href: "/#faq" },
  { label: "About", href: "/#about" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [logo, setLogo] = useState({ text: "Bridge3 Academy", url: "" });
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadLogo() {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setLogo({
              text: data.settings.logoText || "Bridge3 Academy",
              url: data.settings.logoUrl || "",
            });
          }
        }
      } catch {}
    }
    loadLogo();
  }, []);

  // Check auth state so we can show "Dashboard" vs "Sign up / Log in"
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (active) setIsSignedIn(!!data.session);
    })();
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        setIsSignedIn(!!session);
      }
    );
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/waitlist") || pathname?.startsWith("/video-capture")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/95 backdrop-blur no-print">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-medium tracking-tight text-ink">
          {logo.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.url} alt={logo.text} className="h-7 w-auto object-contain" />
          ) : null}
          <span>{logo.text}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                Sign up / Log in
              </Link>
              <Link
                href="/#waitlist"
                className="rounded bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
              >
                Join Waitlist
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded border border-border"
          >
            <span className="sr-only">Toggle menu</span>
            <div className="flex flex-col gap-1">
              <span className="h-px w-5 bg-ink" />
              <span className="h-px w-5 bg-ink" />
              <span className="h-px w-5 bg-ink" />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink-soft"
              >
                {link.label}
              </Link>
            ))}
            {isSignedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="w-fit rounded bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-ink-soft"
                >
                  Sign up / Log in
                </Link>
                <Link
                  href="/#waitlist"
                  onClick={() => setOpen(false)}
                  className="w-fit rounded bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast"
                >
                  Join Waitlist
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
