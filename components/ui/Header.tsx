"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-medium tracking-tight text-ink">
          Bridge3 Academy
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
          <Link
            href="/login"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Login
          </Link>
          <Link
            href="/#waitlist"
            className="rounded bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
          >
            Join Waitlist
          </Link>
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
            <Link href="/login" className="text-sm font-medium text-ink-soft">
              Login
            </Link>
            <Link
              href="/#waitlist"
              className="w-fit rounded bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast"
            >
              Join Waitlist
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
