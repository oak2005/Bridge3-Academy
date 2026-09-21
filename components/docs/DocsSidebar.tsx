"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_CATEGORIES, getArticlesByCategory } from "@/lib/docs/data";
import { DocsSearch } from "@/components/docs/DocsSearch";

export function DocsSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDocsHome = pathname === "/docs";

  return (
    <>
      {/* Mobile Toggle Button (Sticky below header) */}
      <div className="sticky top-[65px] z-30 flex items-center justify-between border-b border-border bg-paper/95 px-4 py-3 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-paper-raised px-3 py-1.5 text-xs font-semibold text-ink"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          {mobileOpen ? "Close Menu" : "Documentation Menu"}
        </button>

        <Link
          href="/docs"
          className="text-xs font-semibold text-accent hover:underline"
        >
          Docs Overview →
        </Link>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed bottom-0 top-[65px] z-40 w-72 shrink-0 overflow-y-auto border-r border-border bg-paper p-5 transition-transform duration-200 ease-in-out md:static md:top-auto md:z-auto md:w-64 md:translate-x-0 md:border-r md:p-6 lg:w-72 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Search Bar */}
        <div className="mb-6">
          <DocsSearch />
        </div>

        {/* Docs Home Link */}
        <div className="mb-6">
          <Link
            href="/docs"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              isDocsHome
                ? "bg-accent-tint text-accent"
                : "text-ink hover:bg-paper-hover"
            }`}
          >
            <span className="text-sm">📖</span>
            Overview &amp; Quick Start
          </Link>
        </div>

        {/* Categories & Articles List */}
        <nav className="space-y-6">
          {DOC_CATEGORIES.map((category) => {
            const articles = getArticlesByCategory(category.id);

            return (
              <div key={category.id}>
                <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </div>

                <ul className="mt-1 space-y-0.5 border-l border-border/70 pl-2 ml-4">
                  {articles.map((article) => {
                    const articlePath = `/docs/${article.slug}`;
                    const isActive = pathname === articlePath;

                    return (
                      <li key={article.slug}>
                        <Link
                          href={articlePath}
                          onClick={() => setMobileOpen(false)}
                          className={`group flex items-center justify-between rounded-md px-3 py-1.5 text-xs transition-colors ${
                            isActive
                              ? "border-l-2 -ml-[9px] border-accent bg-accent-tint/60 font-semibold text-accent"
                              : "text-ink-soft hover:bg-paper-hover hover:text-ink"
                          }`}
                        >
                          <span className="line-clamp-1">{article.title}</span>
                          {isActive && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Help / Back to Dashboard Box */}
        <div className="mt-8 rounded-xl border border-border bg-paper-raised p-4">
          <p className="text-xs font-semibold text-ink">Ready to learn?</p>
          <p className="mt-1 text-[11px] text-ink-muted leading-relaxed">
            Jump directly into your enrolled courses and submit practical workshop projects.
          </p>
          <Link
            href="/dashboard/my-courses"
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
          >
            Go to LMS Dashboard →
          </Link>
        </div>
      </aside>
    </>
  );
}
