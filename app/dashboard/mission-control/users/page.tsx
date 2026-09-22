"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface UserRow {
  id: string;
  full_name: string | null;
  university: string | null;
  role: "student" | "mentor" | "admin";
  is_active: boolean;
  track: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "mentor" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deactivated">("all");

  useEffect(() => {
    if (profileLoading) return;
    if (profile && profile.role !== "admin") router.replace("/dashboard");
  }, [profile, profileLoading, router]);

  const loadUsers = useCallback(async () => {
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    loadUsers();
  }, [profile, loadUsers]);

  async function updateUser(userId: string, updates: { role?: string; isActive?: boolean }) {
    setBusyId(userId);
    setError("");
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const res = await fetch("/api/admin/users/update", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, ...updates }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error || "Could not update this user.");
    } else {
      if (data.profile) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  role: data.profile.role,
                  is_active: data.profile.is_active,
                }
              : u
          )
        );
      }
      await loadUsers();
    }
    setBusyId(null);
  }

  function handleRoleChange(user: UserRow, newRole: string) {
    if (newRole === user.role) return;
    const confirmed = window.confirm(
      `Change ${user.full_name || "this user"}'s role from ${user.role} to ${newRole}?`
    );
    if (confirmed) updateUser(user.id, { role: newRole });
  }

  function handleToggleActive(user: UserRow) {
    const action = user.is_active ? "Deactivate" : "Reactivate";
    const warning = user.is_active
      ? " They will be signed out and won't be able to access the platform until reactivated. Their work is kept."
      : "";
    const confirmed = window.confirm(
      `${action} ${user.full_name || "this user"}?${warning}`
    );
    if (confirmed) updateUser(user.id, { isActive: !user.is_active });
  }

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      // Status filter
      if (statusFilter === "active" && !u.is_active) return false;
      if (statusFilter === "deactivated" && u.is_active) return false;
      // Search query
      const clean = searchQuery.trim().toLowerCase();
      if (!clean) return true;
      const nameMatch = u.full_name?.toLowerCase().includes(clean) || false;
      const uniMatch = u.university?.toLowerCase().includes(clean) || false;
      const idMatch = u.id.toLowerCase().includes(clean);
      return nameMatch || uniMatch || idMatch;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  const studentsCount = users.filter((u) => u.role === "student").length;
  const mentorsCount = users.filter((u) => u.role === "mentor").length;
  const adminsCount = users.filter((u) => u.role === "admin").length;

  if (profileLoading || loading) {
    return (
      <div className="mx-auto max-w-content px-6 py-10">
        <div className="h-4 w-32 animate-pulse rounded bg-paper-raised" />
        <div className="mt-3 h-8 w-60 animate-pulse rounded bg-paper-raised" />
        <div className="mt-8 space-y-2">
          <div className="h-12 w-full animate-pulse rounded-xl border border-border bg-paper-raised" />
          <div className="h-48 w-full animate-pulse rounded-xl border border-border bg-paper-raised" />
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      {/* Navigation & Header */}
      <Link
        href="/dashboard/mission-control"
        className="inline-flex items-center gap-1 text-xs font-semibold text-accent-hover hover:underline"
      >
        ← Back to Mission Control
      </Link>
      <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">User Management</h1>
          <p className="mt-1 text-xs text-ink-muted">
            Inspect accounts, manage role permissions, and control platform access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-paper-raised border border-border px-3 py-1 text-xs font-semibold text-ink">
            {filteredUsers.length} of {users.length} accounts
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          ✕ {error}
        </div>
      )}

      {/* Filter & Search Bar Suite */}
      <div className="mt-8 rounded-xl border border-border bg-paper-raised p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, university, or user ID..."
              className="w-full rounded-lg border border-border bg-paper py-2 pl-3.5 pr-8 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-xs text-ink-muted hover:text-ink"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-ink-muted">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-lg border border-border bg-paper px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="deactivated">Deactivated Only</option>
            </select>
          </div>
        </div>

        {/* Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/70">
          <span className="text-[11px] font-semibold text-ink-muted mr-1">Role:</span>
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              roleFilter === "all"
                ? "bg-accent text-accent-contrast"
                : "border border-border bg-paper text-ink-soft hover:bg-paper-hover"
            }`}
          >
            All ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("student")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              roleFilter === "student"
                ? "bg-accent text-accent-contrast"
                : "border border-border bg-paper text-ink-soft hover:bg-paper-hover"
            }`}
          >
            Students ({studentsCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("mentor")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              roleFilter === "mentor"
                ? "bg-accent text-accent-contrast"
                : "border border-border bg-paper text-ink-soft hover:bg-paper-hover"
            }`}
          >
            Mentors ({mentorsCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              roleFilter === "admin"
                ? "bg-accent text-accent-contrast"
                : "border border-border bg-paper text-ink-soft hover:bg-paper-hover"
            }`}
          >
            Admins ({adminsCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-paper-raised shadow-sm">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-muted">
            No accounts match the current search query or filter selection.
          </div>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-paper text-left font-semibold text-ink">
                <th className="p-3">Scholar Name</th>
                <th className="p-3">University</th>
                <th className="p-3">Role</th>
                <th className="p-3">Access Status</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-paper-hover/50">
                  <td className="p-3 text-ink font-medium">
                    {u.full_name || "—"}
                    {u.id === profile.id && (
                      <span className="ml-2 rounded bg-accent-tint px-1.5 py-0.5 text-[10px] font-bold text-accent">
                        you
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-ink-soft">{u.university || "—"}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      disabled={busyId === u.id}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className="rounded border border-border bg-paper px-2 py-1 text-xs text-ink focus:border-accent focus:outline-none disabled:opacity-60"
                    >
                      <option value="student">student</option>
                      <option value="mentor">mentor</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={busyId === u.id}
                      onClick={() => handleToggleActive(u)}
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-60 ${
                        u.is_active
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100"
                          : "border-red-300 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 hover:bg-red-100"
                      }`}
                    >
                      {u.is_active ? "Active" : "Deactivated"}
                    </button>
                  </td>
                  <td className="p-3 text-ink-muted">
                    {new Date(u.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
