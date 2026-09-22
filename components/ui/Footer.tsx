"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Academy",
    links: [
      { label: "About", href: "/#about" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Tracks", href: "/#tracks" },
    ],
  },
  {
    title: "Curriculum",
    links: [
      { label: "Documentation Hub", href: "/docs" },
      { label: "General Track", href: "/docs/track-general" },
      { label: "Developer Track", href: "/docs/track-developer" },
      { label: "Creative Track", href: "/docs/track-creative" },
      { label: "Growth Track", href: "/docs/track-growth" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/legal/terms" },
      { label: "Privacy", href: "/legal/privacy" },
    ],
  },
  {
    title: "Socials",
    links: [
      { label: "X (Twitter)", href: "https://x.com/Bridge3Academy" },
      { label: "Telegram", href: "https://t.me/Bridge3Academy" },
    ],
  },
  {
    title: "Contact",
    links: [{ label: "Bridge3Academy@gmail.com", href: "mailto:Bridge3Academy@gmail.com" }],
  },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/waitlist")) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-paper no-print">
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="font-sans text-sm font-semibold text-ink">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-sm text-ink-muted">© 2026 Bridge3 Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
