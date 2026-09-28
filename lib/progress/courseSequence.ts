/**
 * Bridge3 Academy — Course Sequence Logic
 *
 * Pure functions that determine next/previous navigation within a track.
 * Used by the classroom, quiz, and assignment pages so all pages agree
 * on what "next" means. Do NOT duplicate this logic anywhere else.
 *
 * Sequence within a track:
 *   For each module (in order_index order):
 *     1. Lessons (by order_index)
 *     2. Module quiz, if present
 *     3. Module assignments, if present (by order_index)
 *   → Then the next module
 *
 * After the final item of the final module → track_finished
 * Before the first item of the first module → start_of_track
 */

export type SequenceItemType = "lesson" | "quiz" | "assignment";

export interface SequenceItem {
  type: SequenceItemType;
  id: string;
  moduleId: string;
  /** Human-readable for debugging — not used for logic */
  title?: string;
}

export interface ModuleData {
  id: string;
  title: string;
  order_index: number;
  lessons: { id: string; title: string; order_index: number }[];
  quiz: { id: string; title: string } | null;
  assignments: { id: string; title: string; order_index: number }[];
}

export interface TrackStructure {
  id: string;
  title: string;
  requires_capstone?: boolean;
  modules: ModuleData[];
}

/**
 * Builds a flat, ordered sequence of every item in a track.
 * Modules with no lessons, no quiz, and no assignments are skipped.
 */
export function buildTrackSequence(track: TrackStructure): SequenceItem[] {
  const sequence: SequenceItem[] = [];

  // Sort modules by order_index
  const sortedModules = [...track.modules].sort(
    (a, b) => a.order_index - b.order_index
  );

  for (const mod of sortedModules) {
    // 1. Lessons in order
    const sortedLessons = [...mod.lessons].sort(
      (a, b) => a.order_index - b.order_index
    );
    for (const lesson of sortedLessons) {
      sequence.push({
        type: "lesson",
        id: lesson.id,
        moduleId: mod.id,
        title: lesson.title,
      });
    }

    // 2. Module quiz, if present
    if (mod.quiz) {
      sequence.push({
        type: "quiz",
        id: mod.quiz.id,
        moduleId: mod.id,
        title: mod.quiz.title,
      });
    }

    // 3. Assignments in order
    const sortedAssignments = [...mod.assignments].sort(
      (a, b) => a.order_index - b.order_index
    );
    for (const assignment of sortedAssignments) {
      sequence.push({
        type: "assignment",
        id: assignment.id,
        moduleId: mod.id,
        title: assignment.title,
      });
    }
  }

  return sequence;
}

/**
 * Returns the next item in the sequence, or "track_finished" if the
 * current item is the last one.
 *
 * If `currentId` is not found in the sequence (e.g. admin deleted it),
 * returns null — the caller should handle this gracefully.
 */
export function getNextStep(
  sequence: SequenceItem[],
  currentId: string
): SequenceItem | "track_finished" | null {
  if (sequence.length === 0) return null;

  const index = sequence.findIndex((item) => item.id === currentId);
  if (index === -1) return null; // item not found — deleted mid-session

  if (index === sequence.length - 1) return "track_finished";

  return sequence[index + 1];
}

/**
 * Returns the previous item in the sequence, or "start_of_track" if the
 * current item is the first one.
 *
 * If `currentId` is not found, returns null.
 */
export function getPreviousStep(
  sequence: SequenceItem[],
  currentId: string
): SequenceItem | "start_of_track" | null {
  if (sequence.length === 0) return null;

  const index = sequence.findIndex((item) => item.id === currentId);
  if (index === -1) return null;

  if (index === 0) return "start_of_track";

  return sequence[index - 1];
}

/**
 * Returns the URL path for a given sequence item.
 */
export function getItemUrl(item: SequenceItem): string {
  switch (item.type) {
    case "lesson":
      return `/dashboard/classroom/${item.id}`;
    case "quiz":
      return `/dashboard/assessments/quiz/${item.moduleId}`;
    case "assignment":
      return `/dashboard/workshops/${item.id}`;
  }
}

/**
 * Returns a human-readable label for what "next" means.
 */
export function getItemLabel(item: SequenceItem): string {
  switch (item.type) {
    case "lesson":
      return `Next lesson: ${item.title || "Untitled"}`;
    case "quiz":
      return `Module quiz: ${item.title || "Quiz"}`;
    case "assignment":
      return `Assignment: ${item.title || "Assignment"}`;
  }
}

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Loads the full TrackStructure from Supabase and returns the sequence.
 */
export async function fetchTrackSequence(
  client: SupabaseClient,
  trackId: string
): Promise<{ trackId: string; trackTitle: string; sequence: SequenceItem[] } | null> {
  const { data: track } = await client
    .from("tracks")
    .select("id, title")
    .eq("id", trackId)
    .maybeSingle();

  if (!track) return null;

  const { data: modules } = await client
    .from("modules")
    .select("id, title, order_index")
    .eq("track_id", trackId)
    .order("order_index", { ascending: true });

  const modRows = modules || [];
  if (modRows.length === 0) {
    return { trackId: track.id, trackTitle: track.title, sequence: [] };
  }

  const moduleIds = modRows.map((m) => m.id);

  const [lessonsRes, quizzesRes, assignmentsRes] = await Promise.all([
    client
      .from("lessons")
      .select("id, module_id, title, order_index")
      .in("module_id", moduleIds)
      .order("order_index", { ascending: true }),
    client
      .from("quizzes")
      .select("id, module_id, title")
      .in("module_id", moduleIds),
    client
      .from("assignments")
      .select("id, module_id, title, order_index")
      .in("module_id", moduleIds)
      .order("order_index", { ascending: true }),
  ]);

  const lessonsByMod = new Map<string, { id: string; title: string; order_index: number }[]>();
  for (const l of lessonsRes.data || []) {
    const list = lessonsByMod.get(l.module_id) || [];
    list.push(l);
    lessonsByMod.set(l.module_id, list);
  }

  const quizByMod = new Map<string, { id: string; title: string }>();
  for (const q of quizzesRes.data || []) {
    quizByMod.set(q.module_id, { id: q.id, title: q.title });
  }

  const assignmentsByMod = new Map<string, { id: string; title: string; order_index: number }[]>();
  for (const a of assignmentsRes.data || []) {
    const list = assignmentsByMod.get(a.module_id) || [];
    list.push(a);
    assignmentsByMod.set(a.module_id, list);
  }

  const trackStructure: TrackStructure = {
    id: track.id,
    title: track.title,
    modules: modRows.map((m) => ({
      id: m.id,
      title: m.title,
      order_index: m.order_index,
      lessons: lessonsByMod.get(m.id) || [],
      quiz: quizByMod.get(m.id) || null,
      assignments: assignmentsByMod.get(m.id) || [],
    })),
  };

  const sequence = buildTrackSequence(trackStructure);
  return { trackId: track.id, trackTitle: track.title, sequence };
}

/**
 * Loads the track sequence given any module ID.
 */
export async function fetchTrackSequenceForModule(
  client: SupabaseClient,
  moduleId: string
): Promise<{ trackId: string; trackTitle: string; sequence: SequenceItem[] } | null> {
  const { data: mod } = await client
    .from("modules")
    .select("track_id")
    .eq("id", moduleId)
    .maybeSingle();

  if (!mod?.track_id) return null;
  return fetchTrackSequence(client, mod.track_id);
}

