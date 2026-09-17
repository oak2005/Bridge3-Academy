import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin, logAdminAction } from "@/lib/auth/verifyAdmin";

const TABLE_BY_TYPE: Record<string, string> = {
  track: "tracks",
  module: "modules",
  lesson: "lessons",
};

const ALLOWED_FIELDS: Record<string, string[]> = {
  track: ["slug", "title", "description", "track_type", "coming_soon"],
  module: ["track_id", "title", "description"],
  lesson: ["module_id", "title", "video_url", "duration_minutes"],
};

const PARENT_FIELD: Record<string, string | null> = {
  track: null,
  module: "track_id",
  lesson: "module_id",
};

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  const { entityType, id, fields } = body || {};

  const table = TABLE_BY_TYPE[entityType];
  if (!table || !fields) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Only allow known-safe columns through — never trust the client for
  // arbitrary column names.
  const safeFields: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS[entityType]) {
    if (fields[key] !== undefined) safeFields[key] = fields[key];
  }

  if (id) {
    // Update
    const { error } = await supabaseAdmin.from(table).update(safeFields).eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Could not save changes." }, { status: 500 });
    }
    await logAdminAction({
      actorId: auth.userId,
      action: `${entityType}_updated`,
      targetType: entityType,
      targetId: id,
      details: typeof safeFields.title === "string" ? safeFields.title : undefined,
    });
    return NextResponse.json({ ok: true, id });
  }

  // Create — compute the next order_index among siblings.
  const parentField = PARENT_FIELD[entityType];
  let orderIndex = 1;
  if (parentField && safeFields[parentField]) {
    const { count } = await supabaseAdmin
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq(parentField, safeFields[parentField] as string);
    orderIndex = (count || 0) + 1;
  } else if (!parentField) {
    const { count } = await supabaseAdmin.from(table).select("id", { count: "exact", head: true });
    orderIndex = (count || 0) + 1;
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from(table)
    .insert({ ...safeFields, order_index: orderIndex })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json({ error: "Could not create this item." }, { status: 500 });
  }

  await logAdminAction({
    actorId: auth.userId,
    action: `${entityType}_created`,
    targetType: entityType,
    targetId: inserted.id,
    details: typeof safeFields.title === "string" ? safeFields.title : undefined,
  });

  return NextResponse.json({ ok: true, id: inserted.id });
}
