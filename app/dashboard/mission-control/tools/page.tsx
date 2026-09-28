"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
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
  is_published: boolean;
  order_index: number;
  pricing_type: string;
  difficulty: string;
  tags: string[];
}

async function authedFetch(path: string, options: RequestInit = {}) {
  const { data: sessionData } = await supabaseBrowser.auth.getSession();
  const token = sessionData.session?.access_token;
  return fetch(path, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}

export default function AdminToolsPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<Partial<ToolItem> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<ToolCategory> | null>(null);

  useEffect(() => {
    if (profileLoading) return;
    if (profile && profile.role !== "admin") router.replace("/dashboard");
  }, [profile, profileLoading, router]);

  const loadData = useCallback(async () => {
    const res = await authedFetch("/api/admin/tools");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories || []);
      setTools(data.tools || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    loadData();
  }, [profile, loadData]);

  async function handleSaveCategory(fields: Partial<ToolCategory>) {
    await authedFetch("/api/admin/tools/save", {
      method: "POST",
      body: JSON.stringify({
        entityType: "category",
        id: fields.id || null,
        fields,
      }),
    });
    setEditingCategory(null);
    await loadData();
  }

  async function handleSaveTool(fields: Partial<ToolItem>) {
    await authedFetch("/api/admin/tools/save", {
      method: "POST",
      body: JSON.stringify({
        entityType: "tool",
        id: fields.id || null,
        fields,
      }),
    });
    setEditingTool(null);
    await loadData();
  }

  async function handleDelete(entityType: "category" | "tool", id: string, label: string) {
    if (!confirm(`Are you sure you want to delete "${label}"?`)) return;
    await authedFetch("/api/admin/tools/delete", {
      method: "POST",
      body: JSON.stringify({ entityType, id, label }),
    });
    await loadData();
  }

  async function handleTogglePublished(tool: ToolItem) {
    await authedFetch("/api/admin/tools/save", {
      method: "POST",
      body: JSON.stringify({
        entityType: "tool",
        id: tool.id,
        fields: { ...tool, is_published: !tool.is_published },
      }),
    });
    await loadData();
  }

  if (profileLoading || loading) return <p className="px-6 py-12 text-ink-muted">Loading…</p>;
  if (!profile || profile.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <Link href="/dashboard/mission-control" className="text-sm text-accent-hover underline">
        ← Mission Control
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Web3 Tools Directory Admin</h1>
          <p className="text-xs text-ink-muted">Manage categories, recommended tools, and curated ecosystem links</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditingCategory({})}
            className="rounded border border-border px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-paper-raised"
          >
            + New Category
          </button>
          <button
            type="button"
            onClick={() =>
              setEditingTool({
                category_id: categories[0]?.id || "",
                pricing_type: "free",
                difficulty: "beginner",
                is_published: true,
                is_featured: false,
              })
            }
            className="rounded bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast hover:bg-accent-hover"
          >
            + New Tool
          </button>
        </div>
      </div>

      {/* Edit Category Modal / Form */}
      {editingCategory && (
        <div className="mt-6 rounded-xl border border-accent/40 bg-paper-raised p-5 shadow-sm">
          <h3 className="font-display text-sm font-bold text-ink">
            {editingCategory.id ? "Edit Category" : "New Category"}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Category Name (e.g. Wallets)"
              value={editingCategory.name || ""}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              className="rounded border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
            <input
              placeholder="Slug (e.g. wallets)"
              value={editingCategory.slug || ""}
              onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
              className="rounded border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
          </div>
          <input
            placeholder="Short Description"
            value={editingCategory.description || ""}
            onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
            className="mt-2 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleSaveCategory(editingCategory)}
              className="rounded bg-accent px-4 py-1.5 text-xs font-semibold text-accent-contrast hover:bg-accent-hover"
            >
              Save Category
            </button>
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              className="rounded border border-border px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Tool Modal / Form */}
      {editingTool && (
        <div className="mt-6 rounded-xl border border-accent/40 bg-paper-raised p-5 shadow-sm">
          <h3 className="font-display text-sm font-bold text-ink">
            {editingTool.id ? "Edit Tool" : "New Tool"}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-ink-muted">Category</label>
              <select
                value={editingTool.category_id || ""}
                onChange={(e) => setEditingTool({ ...editingTool, category_id: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-muted">Tool Name</label>
              <input
                placeholder="Name (e.g. Leather Wallet)"
                value={editingTool.name || ""}
                onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink"
              >
              </input>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-muted">URL</label>
              <input
                placeholder="https://..."
                value={editingTool.url || ""}
                onChange={(e) => setEditingTool({ ...editingTool, url: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-semibold text-ink-muted">Description</label>
            <textarea
              placeholder="Clear summary of what the tool does and why students should use it..."
              rows={3}
              value={editingTool.description || ""}
              onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
              className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs font-semibold text-ink-muted">Difficulty</label>
              <select
                value={editingTool.difficulty || "beginner"}
                onChange={(e) => setEditingTool({ ...editingTool, difficulty: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-muted">Pricing</label>
              <select
                value={editingTool.pricing_type || "free"}
                onChange={(e) => setEditingTool({ ...editingTool, pricing_type: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink"
              >
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-muted">Tags (comma-separated)</label>
              <input
                placeholder="stacks, bitcoin, wallet"
                value={Array.isArray(editingTool.tags) ? editingTool.tags.join(", ") : editingTool.tags || ""}
                onChange={(e) => setEditingTool({ ...editingTool, tags: e.target.value as any })}
                className="mt-1 w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink"
              />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editingTool.is_featured}
                  onChange={(e) => setEditingTool({ ...editingTool, is_featured: e.target.checked })}
                />
                Featured Tool (Start Here)
              </label>
              <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingTool.is_published !== false}
                  onChange={(e) => setEditingTool({ ...editingTool, is_published: e.target.checked })}
                />
                Published (Visible to students)
              </label>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => handleSaveTool(editingTool)}
              className="rounded bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast hover:bg-accent-hover"
            >
              Save Tool
            </button>
            <button
              type="button"
              onClick={() => setEditingTool(null)}
              className="rounded border border-border px-3 py-2 text-xs text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories & Tools List */}
      <div className="mt-8 flex flex-col gap-8">
        {categories.map((cat) => {
          const catTools = tools.filter((t) => t.category_id === cat.id);
          return (
            <div key={cat.id} className="rounded-xl border border-border bg-paper-raised p-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="font-display text-base font-bold text-ink">
                    {cat.name} <span className="text-xs font-normal text-ink-muted">({catTools.length} tools)</span>
                  </h2>
                  {cat.description && <p className="text-xs text-ink-muted">{cat.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(cat)}
                    className="text-xs text-accent-hover hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete("category", cat.id, cat.name)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {catTools.length === 0 ? (
                <p className="mt-3 text-xs text-ink-muted">No tools in this category yet.</p>
              ) : (
                <div className="mt-3 divide-y divide-border">
                  {catTools.map((tool) => (
                    <div key={tool.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-ink">{tool.name}</span>
                          {tool.is_featured && (
                            <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                              ★ Featured
                            </span>
                          )}
                          {!tool.is_published && (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                              Draft (Unpublished)
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-ink-soft line-clamp-1">{tool.description}</p>
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-[11px] text-accent hover:underline inline-block truncate max-w-md"
                        >
                          {tool.url}
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(tool)}
                          className="rounded border border-border px-2.5 py-1 text-xs text-ink-soft hover:bg-paper"
                        >
                          {tool.is_published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTool(tool)}
                          className="rounded border border-border px-2.5 py-1 text-xs text-accent-hover hover:bg-accent/10"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete("tool", tool.id, tool.name)}
                          className="rounded border border-red-700/30 px-2.5 py-1 text-xs text-red-500 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
