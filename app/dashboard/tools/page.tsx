"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/auth/useProfile";

interface ToolCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
}

interface ToolItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  url: string;
  logo_url: string | null;
  is_featured: boolean;
  order_index: number;
  pricing_type: "free" | "freemium" | "paid";
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

export default function StudentToolsPage() {
  const { profile } = useProfile();
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tools");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          setTools(data.tools || []);
        }
      } catch (err) {
        console.error("Failed to load tools:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  const featuredTools = useMemo(() => {
    return tools.filter((t) => t.is_featured);
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Category filter
      if (selectedCategory !== "all" && tool.category_id !== selectedCategory) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== "all" && tool.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesDesc = tool.description.toLowerCase().includes(q);
        const matchesTags = tool.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [tools, selectedCategory, selectedDifficulty, searchQuery]);

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Ecosystem Directory
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink">Web3 Tools & Resources</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Curated, beginner-friendly tools, wallets, exchanges, and development sandboxes designed
            to take you from zero to on-chain across Africa and beyond.
          </p>
        </div>

        {profile?.role === "admin" && (
          <Link
            href="/dashboard/mission-control/tools"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-xs font-bold text-accent hover:bg-accent/20 transition-all shadow-sm"
          >
            <span>⚙️ Edit Tools & Categories (Admin CMS)</span>
            <span>→</span>
          </Link>
        )}
      </div>

      {/* "Start Here" Quick Strip */}
      {!loading && featuredTools.length > 0 && selectedCategory === "all" && !searchQuery && (
        <div className="mt-8 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-contrast">
              ★
            </span>
            <h2 className="font-display text-base font-semibold text-ink">
              Start Here: Beginner Essentials
            </h2>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            The fundamental tools every student needs on day one.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTools.slice(0, 4).map((tool) => (
              <a
                key={tool.id}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-border bg-paper p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-ink group-hover:text-accent transition-colors">
                      {tool.name}
                    </span>
                    <span className="text-xs text-ink-muted group-hover:text-accent">↗</span>
                  </div>
                  <p className="mt-1.5 text-xs text-ink-soft line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent capitalize">
                    {tool.difficulty}
                  </span>
                  <span className="rounded border border-border px-2 py-0.5 text-[10px] text-ink-muted uppercase">
                    {tool.pricing_type}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col gap-4">
        {/* Search Input & Difficulty Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name, description, or tags (e.g. stacks, bitcoin, wallet)..."
              className="w-full rounded-xl border border-border bg-paper-raised px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-ink-muted hover:text-ink"
              >
                ✕ Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-xl border border-border bg-paper-raised px-3 py-2.5 text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === "all"
                ? "bg-accent text-accent-contrast shadow-sm"
                : "border border-border bg-paper-raised text-ink-soft hover:bg-paper hover:text-ink"
            }`}
          >
            All Categories ({tools.length})
          </button>
          {categories.map((cat) => {
            const count = tools.filter((t) => t.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-accent text-accent-contrast shadow-sm"
                    : "border border-border bg-paper-raised text-ink-soft hover:bg-paper hover:text-ink"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tools Grid */}
      {loading ? (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl border border-border bg-paper-raised p-5"
            />
          ))}
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="mt-12 rounded-xl border border-border bg-paper-raised p-12 text-center">
          <p className="text-base font-semibold text-ink">No tools match your criteria.</p>
          <p className="mt-1 text-xs text-ink-muted">
            Try adjusting your search terms or selecting a different category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setSelectedDifficulty("all");
            }}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast hover:bg-accent-hover"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="group flex flex-col justify-between rounded-xl border border-border bg-paper-raised p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                      {categoryMap.get(tool.category_id) || "Tool"}
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink group-hover:text-accent transition-colors">
                      {tool.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tool.is_featured && (
                      <span
                        className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent"
                        title="Featured Tool"
                      >
                        ★ Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="mt-2.5 text-xs leading-relaxed text-ink-soft">
                  {tool.description}
                </p>

                {/* Tags */}
                {tool.tags && tool.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-paper px-2 py-0.5 text-[10px] text-ink-muted border border-border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent capitalize">
                    {tool.difficulty}
                  </span>
                  <span className="rounded border border-border px-2 py-0.5 text-[10px] text-ink-muted uppercase">
                    {tool.pricing_type}
                  </span>
                </div>

                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                >
                  <span>Visit</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
