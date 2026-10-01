"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface Submission {
  id: string;
  email: string;
  taskType: string;
  taskTitle: string;
  submissionText: string | null;
  screenshotUrl: string | null;
  createdAt: string;
}

interface WaitlistTask {
  id: string;
  title: string;
  description: string;
  actionUrl: string | null;
  actionLabel: string | null;
  inputType: "username" | "url" | "screenshot" | "none";
  inputPlaceholder: string | null;
  weight: number;
  isActive: boolean;
  isSystem: boolean;
  displayOrder: number;
}

export default function WaitlistMissionControlPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState<"submissions" | "tasks">("submissions");

  // Submissions state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Tasks state
  const [tasks, setTasks] = useState<WaitlistTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [editingTask, setEditingTask] = useState<WaitlistTask | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [taskForm, setTaskForm] = useState({
    id: "",
    title: "",
    description: "",
    actionUrl: "",
    actionLabel: "",
    inputType: "username" as "username" | "url" | "none",
    inputPlaceholder: "",
    weight: 25,
    isActive: true,
    displayOrder: 10,
  });
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Reordering & Drag state
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (profileLoading) return;
    if (profile && profile.role !== "admin") router.replace("/dashboard");
  }, [profile, profileLoading, router]);

  // Load Submissions
  const loadSubmissions = useCallback(async () => {
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;
    const res = await fetch("/api/admin/waitlist-review", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data.submissions || []);
    }
    setLoadingSubmissions(false);
  }, []);

  // Load Tasks
  const loadTasks = useCallback(async () => {
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;
    const res = await fetch("/api/admin/waitlist-tasks", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks || []);
    }
    setLoadingTasks(false);
  }, []);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    loadSubmissions();
    loadTasks();
  }, [profile, loadSubmissions, loadTasks]);

  // Review submission
  async function review(submissionId: string, status: "verified" | "rejected") {
    setBusyId(submissionId);
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const res = await fetch("/api/admin/waitlist-review", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ submissionId, status }),
    });

    if (res.ok) {
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    }
    setBusyId(null);
  }

  // Toggle task active
  async function handleToggleTask(task: WaitlistTask) {
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const res = await fetch("/api/admin/waitlist-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        action: "toggle",
        task: { id: task.id, isActive: !task.isActive },
      }),
    });

    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, isActive: !t.isActive } : t))
      );
    }
  }

  // Delete task
  async function handleDeleteTask(task: WaitlistTask) {
    if (task.isSystem) {
      alert("System tasks cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to delete task "${task.title}"?`)) return;

    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const res = await fetch("/api/admin/waitlist-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: "delete", task: { id: task.id } }),
    });

    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setActionMessage({ type: "success", text: `Deleted task "${task.title}".` });
    }
  }

  // Save task (create or edit)
  async function handleSaveTask(e: React.FormEvent) {
    e.preventDefault();
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const action = editingTask ? "update" : "create";
    const payload = editingTask
      ? { ...taskForm, id: editingTask.id }
      : { ...taskForm };

    const res = await fetch("/api/admin/waitlist-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, task: payload }),
    });

    if (res.ok) {
      setIsCreating(false);
      setEditingTask(null);
      setActionMessage({
        type: "success",
        text: `Task ${editingTask ? "updated" : "created"} successfully!`,
      });
      loadTasks();
    } else {
      const data = await res.json().catch(() => ({}));
      setActionMessage({ type: "error", text: data.error || "Failed to save task." });
    }
  }

  // Move task up or down
  async function handleMoveTask(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const nextTasks = [...tasks];
    const [moved] = nextTasks.splice(index, 1);
    nextTasks.splice(targetIndex, 0, moved);

    const reindexed = nextTasks.map((t, idx) => ({ ...t, displayOrder: idx + 1 }));
    setTasks(reindexed);
    setIsReordering(true);

    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/admin/waitlist-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: "reorder",
          orderedIds: reindexed.map((t) => t.id),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionMessage({ type: "error", text: data.error || "Failed to update task sequence." });
        loadTasks();
      } else {
        setActionMessage({ type: "success", text: "Task order updated successfully." });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to update task sequence." });
      loadTasks();
    } finally {
      setIsReordering(false);
    }
  }

  // Drag and drop handlers
  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${index}`);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  async function handleDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    const sourceIndex = draggedIndex;
    setDraggedIndex(null);
    setDragOverIndex(null);

    if (sourceIndex === null || sourceIndex === undefined || sourceIndex === targetIndex) return;

    const nextTasks = [...tasks];
    const [moved] = nextTasks.splice(sourceIndex, 1);
    nextTasks.splice(targetIndex, 0, moved);

    const reindexed = nextTasks.map((t, idx) => ({ ...t, displayOrder: idx + 1 }));
    setTasks(reindexed);
    setIsReordering(true);

    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/admin/waitlist-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: "reorder",
          orderedIds: reindexed.map((t) => t.id),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionMessage({ type: "error", text: data.error || "Failed to save reordered tasks." });
        loadTasks();
      } else {
        setActionMessage({ type: "success", text: "Task order updated successfully." });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to save reordered tasks." });
      loadTasks();
    } finally {
      setIsReordering(false);
    }
  }

  function startEdit(t: WaitlistTask) {
    setEditingTask(t);
    setIsCreating(false);
    setTaskForm({
      id: t.id,
      title: t.title,
      description: t.description,
      actionUrl: t.actionUrl || "",
      actionLabel: t.actionLabel || "",
      inputType: t.inputType === "none" ? "none" : t.inputType === "url" ? "url" : "username",
      inputPlaceholder: t.inputPlaceholder || "",
      weight: t.weight || 25,
      isActive: t.isActive,
      displayOrder: t.displayOrder || 10,
    });
  }

  function startCreate() {
    setEditingTask(null);
    setIsCreating(true);
    setTaskForm({
      id: "",
      title: "",
      description: "",
      actionUrl: "",
      actionLabel: "",
      inputType: "username",
      inputPlaceholder: "@handle or link",
      weight: 25,
      isActive: true,
      displayOrder: tasks.length + 1,
    });
  }

  if (profileLoading || (loadingSubmissions && loadingTasks)) {
    return (
      <div className="mx-auto max-w-content px-6 py-10">
        <div className="h-6 w-36 animate-pulse rounded bg-paper-raised" />
        <div className="mt-4 h-10 w-64 animate-pulse rounded bg-paper-raised" />
      </div>
    );
  }

  if (!profile || profile.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      {/* Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
        <Link href="/dashboard/mission-control" className="text-accent-hover hover:underline">
          ← Mission Control
        </Link>
        <span>/</span>
        <span className="text-ink">Waitlist & Verification Tasks</span>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">Waitlist Management</h1>
          <p className="mt-1 text-xs text-ink-muted">
            Review applicant task submissions and configure verification tasks that appear on the waitlist dashboard.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center rounded-lg border border-border bg-paper-raised p-1">
          <button
            type="button"
            onClick={() => setActiveTab("submissions")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "submissions"
                ? "bg-accent text-accent-contrast shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Submissions Review ({submissions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "tasks"
                ? "bg-accent text-accent-contrast shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Manage Tasks ({tasks.length})
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`mt-4 rounded-lg p-3.5 text-xs font-semibold ${
            actionMessage.type === "success"
              ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border border-red-300 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {actionMessage.type === "success" ? "✓ " : "✕ "} {actionMessage.text}
        </div>
      )}

      {/* TAB 1: SUBMISSIONS REVIEW */}
      {activeTab === "submissions" && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink">Pending Verification Submissions</h2>
            <span className="text-xs text-ink-muted">{submissions.length} waiting</span>
          </div>

          {submissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-paper-raised p-12 text-center">
              <p className="text-sm font-semibold text-ink">Nothing waiting for review</p>
              <p className="mt-1 text-xs text-ink-muted">
                All submitted waitlist tasks have been reviewed! New submissions will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {submissions.map((s) => (
                <div key={s.id} className="rounded-xl border border-border bg-paper-raised p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <span className="font-semibold text-ink text-sm">{s.email}</span>
                      <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-xs font-bold text-accent border border-border">
                        {s.taskTitle}
                      </span>
                    </div>
                    <span className="text-[11px] text-ink-muted">
                      {new Date(s.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="mt-3 text-xs">
                    <span className="text-ink-muted">Submission proof: </span>
                    <span className="font-mono text-ink font-medium bg-paper px-2 py-1 rounded border border-border">
                      {s.submissionText || "—"}
                    </span>
                  </div>

                  {s.screenshotUrl && (
                    <div className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.screenshotUrl}
                        alt="Screenshot submission"
                        className="max-h-60 rounded-lg border border-border object-contain"
                      />
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                    <button
                      type="button"
                      disabled={busyId === s.id}
                      onClick={() => review(s.id, "rejected")}
                      className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={busyId === s.id}
                      onClick={() => review(s.id, "verified")}
                      className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                    >
                      Verify & Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE VERIFICATION TASKS */}
      {activeTab === "tasks" && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg text-ink">Waitlist Verification Tasks</h2>
              <p className="text-xs text-ink-muted">
                Add, edit, or toggle tasks scholars must complete to earn verification points on the waitlist.
              </p>
            </div>
            {!isCreating && !editingTask && (
              <button
                type="button"
                onClick={startCreate}
                className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast shadow-sm hover:bg-accent-hover transition-colors"
              >
                + Add Verification Task
              </button>
            )}
          </div>

          {/* Create or Edit Task Form */}
          {(isCreating || editingTask) && (
            <form
              onSubmit={handleSaveTask}
              className="rounded-xl border border-accent/40 bg-paper-raised p-6 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-base text-ink">
                  {editingTask ? `Edit Task: ${editingTask.title}` : "Create New Verification Task"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTask(null);
                  }}
                  className="text-xs text-ink-muted hover:text-ink"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-ink-soft">Task Title</label>
                  <input
                    type="text"
                    required
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="e.g. Join Discord Community"
                    className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-soft">Points Weight (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={taskForm.weight}
                    onChange={(e) => setTaskForm({ ...taskForm, weight: Number(e.target.value) || 25 })}
                    className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-ink-soft">Task Description</label>
                  <textarea
                    rows={2}
                    required
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Instructions for the scholar..."
                    className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-soft">Action Link URL (Optional)</label>
                  <input
                    type="url"
                    value={taskForm.actionUrl}
                    onChange={(e) => setTaskForm({ ...taskForm, actionUrl: e.target.value })}
                    placeholder="https://discord.gg/..."
                    className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-soft">Action Button Label</label>
                  <input
                    type="text"
                    value={taskForm.actionLabel}
                    onChange={(e) => setTaskForm({ ...taskForm, actionLabel: e.target.value })}
                    placeholder="e.g. Open Discord"
                    className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-soft">Required Proof Input Type</label>
                  <select
                    value={taskForm.inputType}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, inputType: e.target.value as "username" | "url" | "none" })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="username">Username / Handle</option>
                    <option value="url">Link / URL Proof</option>
                    <option value="none">Automatic / No input</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-soft">Input Placeholder Text</label>
                  <input
                    type="text"
                    value={taskForm.inputPlaceholder}
                    onChange={(e) => setTaskForm({ ...taskForm, inputPlaceholder: e.target.value })}
                    placeholder="e.g. @your_discord_tag"
                    className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-soft">Display Sequence Order</label>
                  <input
                    type="number"
                    min={1}
                    value={taskForm.displayOrder}
                    onChange={(e) => setTaskForm({ ...taskForm, displayOrder: Number(e.target.value) || 1 })}
                    placeholder="1, 2, 3..."
                    className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-ink-muted">Lower numbers appear first on the scholar waitlist page.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTask(null);
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-5 py-2 text-xs font-semibold text-accent-contrast hover:bg-accent-hover"
                >
                  {editingTask ? "Save Task Changes" : "Create Task"}
                </button>
              </div>
            </form>
          )}

          {/* Arrange tasks hint banner */}
          <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3.5 py-2.5 text-xs text-ink-soft">
            <span className="font-bold text-accent">↕ Arrange Tasks:</span>
            <span>
              Use the <span className="font-mono font-bold text-ink">▲</span> and <span className="font-mono font-bold text-ink">▼</span> buttons or grab the <span className="font-mono font-bold text-ink">⠿</span> handle to drag and reorder tasks. Order changes sync immediately to the waitlist page.
            </span>
          </div>

          {/* Task List Table */}
          <div className="overflow-x-auto rounded-xl border border-border bg-paper-raised shadow-sm">
            <table className="w-full min-w-[640px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-paper text-left font-semibold text-ink">
                  <th className="p-3.5 w-24 text-center">Order</th>
                  <th className="p-3.5">Task Title</th>
                  <th className="p-3.5">Points Weight</th>
                  <th className="p-3.5">Input Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tasks.map((task, index) => (
                  <tr
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`transition-colors ${
                      dragOverIndex === index
                        ? "bg-accent/15 border-y-2 border-accent"
                        : draggedIndex === index
                        ? "opacity-40 bg-paper"
                        : "hover:bg-paper-hover/50"
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className="cursor-grab active:cursor-grabbing text-ink-muted hover:text-ink select-none px-1 py-0.5 text-xs font-mono"
                          title="Drag to reorder"
                        >
                          ⠿
                        </span>
                        <span className="inline-flex h-5 w-6 items-center justify-center rounded bg-paper px-1 text-[11px] font-bold text-accent border border-border">
                          #{index + 1}
                        </span>
                        <div className="flex flex-col gap-0.5 ml-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveTask(index, "up")}
                            disabled={index === 0 || isReordering}
                            className="flex h-4 w-5 items-center justify-center rounded border border-border text-[8px] text-ink-soft hover:bg-accent/10 hover:text-accent disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Move up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveTask(index, "down")}
                            disabled={index === tasks.length - 1 || isReordering}
                            className="flex h-4 w-5 items-center justify-center rounded border border-border text-[8px] text-ink-soft hover:bg-accent/10 hover:text-accent disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Move down"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-ink">{task.title}</div>
                      <div className="text-[11px] text-ink-muted line-clamp-1">{task.description}</div>
                      {task.isSystem && (
                        <span className="mt-1 inline-block rounded bg-paper px-1.5 py-0.2 text-[9px] font-bold text-ink-muted border border-border">
                          System Task
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-ink">+{task.weight}%</td>
                    <td className="p-3.5 text-ink-soft capitalize">{task.inputType}</td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                          task.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-ink/10 text-ink-muted"
                        }`}
                      >
                        {task.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                        className="rounded border border-border px-2.5 py-1 text-xs font-semibold text-ink-soft hover:border-accent hover:text-ink"
                      >
                        Edit
                      </button>
                      {!task.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task)}
                          className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
