"use client";

import { useEffect, useState, useCallback } from "react";
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

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not update this user.");
    } else {
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
      ? " They'll be signed out and won't be able to access the platform until reactivated. Their work and history are kept."
      : "";
    const confirmed = window.confirm(
      `${action} ${user.full_name || "this user"}?${warning}`
    );
    if (confirmed) updateUser(user.id, { isActive: !user.is_active });
  }

  if (profileLoading || loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading…</p>;
  }
  if (!profile || profile.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <Link href="/dashboard/mission-control" className="text-sm text-accent-hover underline">
        ← Mission Control
      </Link>
      <h1 className="mt-2 font-display text-2xl text-ink">User Management</h1>
      <p className="mt-1 text-sm text-ink-muted">{users.length} accounts</p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-muted">
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">University</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border">
                <td className="py-3 text-ink">
                  {u.full_name || "—"}
                  {u.id === profile.id && (
                    <span className="ml-2 text-xs text-ink-muted">(you)</span>
                  )}
                </td>
                <td className="py-3 text-ink-soft">{u.university || "—"}</td>
                <td className="py-3">
                  <select
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => handleRoleChange(u, e.target.value)}
                    className="rounded border border-border bg-paper px-2 py-1 text-sm text-ink disabled:opacity-60"
                  >
                    <option value="student">student</option>
                    <option value="mentor">mentor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => handleToggleActive(u)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-60 ${
                      u.is_active
                        ? "border-accent text-accent-hover"
                        : "border-red-200 text-red-700"
                    }`}
                  >
                    {u.is_active ? "Active" : "Deactivated"}
                  </button>
                </td>
                <td className="py-3 text-ink-muted">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
