"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

interface LogEntry {
  id: string;
  actorName: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  createdAt: string;
}

export default function AuditLogPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileLoading) return;
    if (profile && profile.role !== "admin") router.replace("/dashboard");
  }, [profile, profileLoading, router]);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    (async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;
      const res = await fetch("/api/admin/audit-log", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setLog(data.log || []);
      }
      setLoading(false);
    })();
  }, [profile]);

  if (profileLoading || loading) return <p className="px-6 py-12 text-ink-muted">Loading…</p>;
  if (!profile || profile.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <Link href="/dashboard/mission-control" className="text-sm text-accent-hover underline">
        ← Mission Control
      </Link>
      <h1 className="mt-2 font-display text-2xl text-ink">Audit Log</h1>
      <p className="mt-1 text-sm text-ink-muted">Most recent 100 actions.</p>

      {log.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">No actions recorded yet.</p>
      ) : (
        <ul className="mt-6 flex flex-col divide-y divide-border border-y border-border">
          {log.map((entry) => (
            <li key={entry.id} className="py-3">
              <p className="text-sm text-ink">
                <span className="font-medium">{entry.actorName}</span>{" "}
                <span className="text-ink-soft">{entry.action.replace(/_/g, " ")}</span>
                {entry.details && <span className="text-ink-muted"> — {entry.details}</span>}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {new Date(entry.createdAt).toLocaleString()}
                {entry.targetType && ` · ${entry.targetType}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
