import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/auth/verifyAdmin";

const TABLE_BY_TYPE: Record<string, string> = {
  track: "tracks",
  module: "modules",
  lesson: "lessons",
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
  const { entityType, id, direction } = body || {};
  const table = TABLE_BY_TYPE[entityType];

  if (!table || !id || (direction !== "up" && direction !== "down")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { data: current } = await supabaseAdmin.from(table).select("*").eq("id", id).maybeSingle();
  if (!current) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const parentField = PARENT_FIELD[entityType];
  let query = supabaseAdmin.from(table).select("id, order_index");
  if (parentField) query = query.eq(parentField, current[parentField]);

  const { data: siblings } = await query.order("order_index", { ascending: true });
  const list = siblings || [];
  const index = list.findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= list.length) {
    return NextResponse.json({ ok: true }); // already at the edge, nothing to do
  }

  const neighbor = list[swapIndex];

  await supabaseAdmin.from(table).update({ order_index: neighbor.order_index }).eq("id", id);
  await supabaseAdmin.from(table).update({ order_index: current.order_index }).eq("id", neighbor.id);

  return NextResponse.json({ ok: true });
}
