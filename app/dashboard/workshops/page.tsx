"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useProfile } from "@/lib/auth/useProfile";

type Status = "not_submitted" | "submitted" | "under_review" | "needs_revision" | "approved";

interface AssignmentRow {
  id: string;
  title: string;
  module_title: string;
  track_title: string;
  status: Status;
}

const STATUS_LABEL: Record<Status, string> = {
  not_submitted: "Not submitted",
  submitted: "Submitted",
  under_review: "Under Review",
  needs_revision: "Needs Revision",
  approved: "Approved",
};

const STATUS_STYLE: Record<Status, string> = {
  not_submitted: "text-ink-muted border-border",
  submitted: "text-accent-hover border-accent",
  under_review: "text-ink-soft border-border",
  needs_revision: "text-red-700 border-red-200",
  approved: "text-accent-hover border-accent",
};

export default function WorkshopsPage() {
  const { session } = useProfile();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);

  useEffect(() => {
    if (!session) return;

    (async () => {
      const { data: assignmentRows } = await supabaseBrowser
        .from("assignments")
        .select("id, title, module_id, order_index")
        .order("order_index", { ascending: true });

      const { data: moduleRows } = await supabaseBrowser
        .from("modules")
        .select("id, title, track_id");

      const { data: trackRows } = await supabaseBrowser.from("tracks").select("id, title");

      const { data: submissionRows } = await supabaseBrowser
        .from("assignment_submissions")
        .select("assignment_id, status, created_at")
        .eq("student_id", session.user.id)
        .order("created_at", { ascending: false });

      const moduleById = new Map((moduleRows || []).map((m) => [m.id, m]));
      const trackById = new Map((trackRows || []).map((t) => [t.id, t]));

      // Most recent submission per assignment.
      const latestStatusByAssignment = new Map<string, Status>();
      for (const s of submissionRows || []) {
        if (!latestStatusByAssignment.has(s.assignment_id)) {
          latestStatusByAssignment.set(s.assignment_id, s.status as Status);
        }
      }

      const assembled: AssignmentRow[] = (assignmentRows || []).map((a) => {
        const mod = moduleById.get(a.module_id);
        const track = mod ? trackById.get(mod.track_id) : undefined;
        return {
          id: a.id,
          title: a.title,
          module_title: mod?.title || "",
          track_title: track?.title || "",
          status: latestStatusByAssignment.get(a.id) || "not_submitted",
        };
      });

      setAssignments(assembled);
      setLoading(false);
    })();
  }, [session]);

  if (loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading workshops…</p>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <h1 className="font-display text-2xl text-ink">Workshops</h1>
      <p className="mt-2 max-w-prose text-ink-muted">
        Practical assignments tied to what you&rsquo;re learning. Submit your
        work and discuss it with peers below each one.
      </p>

      {assignments.length === 0 ? (
        <p className="mt-8 text-sm text-ink-muted">No assignments published yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col divide-y divide-border border-y border-border">
          {assignments.map((a) => (
            <li key={a.id}>
              <Link
                href={`/dashboard/workshops/${a.id}`}
                className="flex items-center justify-between py-4 hover:bg-paper-raised"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{a.title}</p>
                  <p className="text-xs text-ink-muted">
                    {a.track_title} · {a.module_title}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLE[a.status]}`}
                >
                  {STATUS_LABEL[a.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
