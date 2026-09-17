"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface Track {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  track_type: string;
  order_index: number;
  coming_soon: boolean;
}
interface ModuleRow {
  id: string;
  track_id: string;
  title: string;
  description: string | null;
  order_index: number;
}
interface Lesson {
  id: string;
  module_id: string;
  title: string;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
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

export default function ContentManagementPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null); // "type:id" or "type:new:parentId"

  useEffect(() => {
    if (profileLoading) return;
    if (profile && profile.role !== "admin") router.replace("/dashboard");
  }, [profile, profileLoading, router]);

  const loadContent = useCallback(async () => {
    const res = await authedFetch("/api/admin/content");
    if (res.ok) {
      const data = await res.json();
      setTracks(data.tracks || []);
      setModules(data.modules || []);
      setLessons(data.lessons || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    loadContent();
  }, [profile, loadContent]);

  async function saveEntity(entityType: string, id: string | null, fields: Record<string, unknown>) {
    await authedFetch("/api/admin/content/save", {
      method: "POST",
      body: JSON.stringify({ entityType, id, fields }),
    });
    setEditing(null);
    await loadContent();
  }

  async function deleteEntity(entityType: string, id: string, label: string) {
    const warning =
      entityType === "track"
        ? " This deletes every module and lesson inside it too."
        : entityType === "module"
        ? " This deletes every lesson inside it too."
        : "";
    if (!window.confirm(`Delete "${label}"?${warning} This cannot be undone.`)) return;
    await authedFetch("/api/admin/content/delete", {
      method: "POST",
      body: JSON.stringify({ entityType, id, label }),
    });
    await loadContent();
  }

  async function reorder(entityType: string, id: string, direction: "up" | "down") {
    await authedFetch("/api/admin/content/reorder", {
      method: "POST",
      body: JSON.stringify({ entityType, id, direction }),
    });
    await loadContent();
  }

  if (profileLoading || loading) return <p className="px-6 py-12 text-ink-muted">Loading…</p>;
  if (!profile || profile.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <Link href="/dashboard/mission-control" className="text-sm text-accent-hover underline">
        ← Mission Control
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Content Management</h1>
        <button
          type="button"
          onClick={() => setEditing("track:new")}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
        >
          + New Track
        </button>
      </div>

      {editing === "track:new" && (
        <TrackForm onSave={(fields) => saveEntity("track", null, fields)} onCancel={() => setEditing(null)} />
      )}

      <div className="mt-6 flex flex-col gap-3">
        {tracks.map((track, i) => (
          <div key={track.id} className="rounded border border-border bg-paper-raised">
            <div className="flex items-center justify-between p-4">
              <button
                type="button"
                onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
                className="flex-1 text-left"
              >
                <p className="text-sm font-semibold text-ink">
                  {track.title} <span className="text-xs text-ink-muted">({track.track_type})</span>
                  {track.coming_soon && (
                    <span className="ml-2 text-xs text-ink-muted">Coming soon</span>
                  )}
                </p>
                <p className="text-xs text-ink-muted">/{track.slug}</p>
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => reorder("track", track.id, "up")} disabled={i === 0} className="text-ink-muted disabled:opacity-30">↑</button>
                <button type="button" onClick={() => reorder("track", track.id, "down")} disabled={i === tracks.length - 1} className="text-ink-muted disabled:opacity-30">↓</button>
                <button type="button" onClick={() => setEditing(`track:${track.id}`)} className="text-xs text-accent-hover underline">Edit</button>
                <button type="button" onClick={() => deleteEntity("track", track.id, track.title)} className="text-xs text-red-700 underline">Delete</button>
              </div>
            </div>

            {editing === `track:${track.id}` && (
              <div className="border-t border-border p-4">
                <TrackForm
                  initial={track}
                  onSave={(fields) => saveEntity("track", track.id, fields)}
                  onCancel={() => setEditing(null)}
                />
              </div>
            )}

            {expandedTrack === track.id && (
              <div className="border-t border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Modules</p>
                  <button
                    type="button"
                    onClick={() => setEditing(`module:new:${track.id}`)}
                    className="text-xs text-accent-hover underline"
                  >
                    + Add Module
                  </button>
                </div>

                {editing === `module:new:${track.id}` && (
                  <ModuleForm
                    onSave={(fields) => saveEntity("module", null, { ...fields, track_id: track.id })}
                    onCancel={() => setEditing(null)}
                  />
                )}

                <div className="mt-2 flex flex-col gap-2">
                  {modules
                    .filter((m) => m.track_id === track.id)
                    .map((mod, mi, arr) => (
                      <div key={mod.id} className="rounded border border-border bg-paper">
                        <div className="flex items-center justify-between p-3">
                          <button
                            type="button"
                            onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                            className="flex-1 text-left text-sm text-ink"
                          >
                            {mod.title}
                          </button>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => reorder("module", mod.id, "up")} disabled={mi === 0} className="text-ink-muted disabled:opacity-30">↑</button>
                            <button type="button" onClick={() => reorder("module", mod.id, "down")} disabled={mi === arr.length - 1} className="text-ink-muted disabled:opacity-30">↓</button>
                            <button type="button" onClick={() => setEditing(`module:${mod.id}`)} className="text-xs text-accent-hover underline">Edit</button>
                            <button type="button" onClick={() => deleteEntity("module", mod.id, mod.title)} className="text-xs text-red-700 underline">Delete</button>
                          </div>
                        </div>

                        {editing === `module:${mod.id}` && (
                          <div className="border-t border-border p-3">
                            <ModuleForm
                              initial={mod}
                              onSave={(fields) => saveEntity("module", mod.id, fields)}
                              onCancel={() => setEditing(null)}
                            />
                          </div>
                        )}

                        {expandedModule === mod.id && (
                          <div className="border-t border-border p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Lessons</p>
                              <button
                                type="button"
                                onClick={() => setEditing(`lesson:new:${mod.id}`)}
                                className="text-xs text-accent-hover underline"
                              >
                                + Add Lesson
                              </button>
                            </div>

                            {editing === `lesson:new:${mod.id}` && (
                              <LessonForm
                                onSave={(fields) => saveEntity("lesson", null, { ...fields, module_id: mod.id })}
                                onCancel={() => setEditing(null)}
                              />
                            )}

                            <ul className="mt-2 flex flex-col divide-y divide-border">
                              {lessons
                                .filter((l) => l.module_id === mod.id)
                                .map((lesson, li, larr) => (
                                  <li key={lesson.id}>
                                    <div className="flex items-center justify-between py-2">
                                      <span className="text-sm text-ink-soft">{lesson.title}</span>
                                      <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => reorder("lesson", lesson.id, "up")} disabled={li === 0} className="text-ink-muted disabled:opacity-30">↑</button>
                                        <button type="button" onClick={() => reorder("lesson", lesson.id, "down")} disabled={li === larr.length - 1} className="text-ink-muted disabled:opacity-30">↓</button>
                                        <button type="button" onClick={() => setEditing(`lesson:${lesson.id}`)} className="text-xs text-accent-hover underline">Edit</button>
                                        <button type="button" onClick={() => deleteEntity("lesson", lesson.id, lesson.title)} className="text-xs text-red-700 underline">Delete</button>
                                      </div>
                                    </div>
                                    {editing === `lesson:${lesson.id}` && (
                                      <LessonForm
                                        initial={lesson}
                                        onSave={(fields) => saveEntity("lesson", lesson.id, fields)}
                                        onCancel={() => setEditing(null)}
                                      />
                                    )}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Track>;
  onSave: (fields: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [slug, setSlug] = useState(initial?.slug || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [trackType, setTrackType] = useState(initial?.track_type || "general");
  const [comingSoon, setComingSoon] = useState(initial?.coming_soon || false);

  return (
    <div className="mt-3 flex flex-col gap-2 rounded border border-border bg-paper p-4">
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (e.g. general-track)" className="rounded border border-border px-3 py-2 text-sm" />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded border border-border px-3 py-2 text-sm" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className="rounded border border-border px-3 py-2 text-sm" />
      <select value={trackType} onChange={(e) => setTrackType(e.target.value)} className="rounded border border-border px-3 py-2 text-sm">
        <option value="general">general</option>
        <option value="ecosystem_support">ecosystem_support</option>
        <option value="skill_set">skill_set</option>
      </select>
      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" checked={comingSoon} onChange={(e) => setComingSoon(e.target.checked)} />
        Coming soon (not yet enrollable)
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave({ slug, title, description, track_type: trackType, coming_soon: comingSoon })}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
        >
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-border px-4 py-2 text-sm text-ink-soft">
          Cancel
        </button>
      </div>
    </div>
  );
}

function ModuleForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<ModuleRow>;
  onSave: (fields: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");

  return (
    <div className="mt-3 flex flex-col gap-2 rounded border border-border bg-paper-raised p-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded border border-border px-3 py-2 text-sm" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className="rounded border border-border px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave({ title, description })} className="rounded bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover">
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-border px-4 py-2 text-sm text-ink-soft">
          Cancel
        </button>
      </div>
    </div>
  );
}

function LessonForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Lesson>;
  onSave: (fields: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [videoUrl, setVideoUrl] = useState(initial?.video_url || "");
  const [duration, setDuration] = useState(initial?.duration_minutes?.toString() || "");

  return (
    <div className="mt-2 flex flex-col gap-2 rounded border border-border bg-paper p-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded border border-border px-3 py-2 text-sm" />
      <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL (YouTube, Vimeo, or direct file)" className="rounded border border-border px-3 py-2 text-sm" />
      <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (minutes)" type="number" className="rounded border border-border px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            onSave({
              title,
              video_url: videoUrl || null,
              duration_minutes: duration ? parseInt(duration, 10) : null,
            })
          }
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
        >
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-border px-4 py-2 text-sm text-ink-soft">
          Cancel
        </button>
      </div>
    </div>
  );
}
