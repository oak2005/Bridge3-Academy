"use client";

import { useState } from "react";
import Link from "next/link";
import { searchArticles, DocArticle } from "@/lib/docs/data";

export function DocsSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const results = query.trim() ? searchArticles(query).slice(0, 6) : [];

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <svg
          className="pointer-events-none absolute left-3.5 h-4 w-4 text-ink-muted"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search documentation..."
          className="w-full rounded-lg border border-border bg-paper py-2 pl-10 pr-9 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 rounded p-0.5 text-ink-muted hover:text-ink"
            aria-label="Clear search"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Live Dropdown Results */}
      {isFocused && query.trim() && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsFocused(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-border bg-paper p-2 shadow-xl">
            {results.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-ink-muted">
                No documentation found matching &ldquo;{query}&rdquo;
              </p>
            ) : (
              <div className="space-y-1">
                <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  Search Results ({results.length})
                </p>
                {results.map((article: DocArticle) => (
                  <Link
                    key={article.slug}
                    href={`/docs/${article.slug}`}
                    onClick={() => {
                      setIsFocused(false);
                      setQuery("");
                    }}
                    className="block rounded-lg px-3 py-2 text-left transition-colors hover:bg-paper-hover"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-ink">{article.title}</p>
                      <span className="shrink-0 rounded bg-paper-raised px-1.5 py-0.5 text-[10px] text-ink-muted">
                        {article.categoryLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-muted">
                      {article.summary}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
