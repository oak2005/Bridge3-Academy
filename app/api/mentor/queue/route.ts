import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyMentor } from "@/lib/auth/verifyMentor";
import { jsonNoStore } from "@/lib/http/noStore";

export const dynamic = "force-dynamic";

const PENDING_STATUSES = ["submitted", "under_review"];

interface AssignmentSubRow {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string | null;
  status: string;
  created_at: string;
}

interface CapstoneSubRow {
  id: string;
  track_id: string;
  student_id: string;
  portfolio_description: string | null;
  status: string;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const auth = await verifyMentor(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name");
  const nameById = new Map((profiles || []).map((p) => [p.id, p.full_name || "Student"]));

  // Assignments
  const { data: assignmentSubs } = await supabaseAdmin
    .from("assignment_submissions")
    .select("id, assignment_id, student_id, submission_text, status, created_at")
    .order("created_at", { ascending: false });

  const { data: assignments } = await supabaseAdmin.from("assignments").select("id, title");
  const assignmentTitleById = new Map((assignments || []).map((a) => [a.id, a.title]));

  const latestAssignmentByPair = new Map<string, AssignmentSubRow>();
  for (const s of assignmentSubs || []) {
    const key = `${s.assignment_id}:${s.student_id}`;
    if (!latestAssignmentByPair.has(key)) latestAssignmentByPair.set(key, s);
  }

  const assignmentQueue = Array.from(latestAssignmentByPair.values())
    .filter((s) => PENDING_STATUSES.includes(s.status))
    .map((s) => ({
      type: "assignment" as const,
      submissionId: s.id,
      title: assignmentTitleById.get(s.assignment_id) || "Assignment",
      studentId: s.student_id,
      studentName: nameById.get(s.student_id) || "Student",
      status: s.status,
      createdAt: s.created_at,
      preview: (s.submission_text || "").slice(0, 140),
    }));

  // Capstones
  const { data: capstoneSubs } = await supabaseAdmin
    .from("capstone_submissions")
    .select("id, track_id, student_id, portfolio_description, status, created_at")
    .order("created_at", { ascending: false });

  const { data: tracks } = await supabaseAdmin.from("tracks").select("id, title");
  const trackTitleById = new Map((tracks || []).map((t) => [t.id, t.title]));

  const latestCapstoneByPair = new Map<string, CapstoneSubRow>();
  for (const s of capstoneSubs || []) {
    const key = `${s.track_id}:${s.student_id}`;
    if (!latestCapstoneByPair.has(key)) latestCapstoneByPair.set(key, s);
  }

  const capstoneQueue = Array.from(latestCapstoneByPair.values())
    .filter((s) => PENDING_STATUSES.includes(s.status))
    .map((s) => ({
      type: "capstone" as const,
      submissionId: s.id,
      title: `${trackTitleById.get(s.track_id) || "Track"} — Capstone`,
      studentId: s.student_id,
      studentName: nameById.get(s.student_id) || "Student",
      status: s.status,
      createdAt: s.created_at,
      preview: (s.portfolio_description || "").slice(0, 140),
    }));

  const queue = [...assignmentQueue, ...capstoneQueue].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return jsonNoStore({ queue });
}
