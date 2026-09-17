import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin, logAdminAction } from "@/lib/auth/verifyAdmin";

const TABLE_BY_TYPE: Record<string, string> = {
  track: "tracks",
  module: "modules",
  lesson: "lessons",
};

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  const { entityType, id, label } = body || {};
  const table = TABLE_BY_TYPE[entityType];

  if (!table || !id) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Deleting a track/module cascades to its modules/lessons at the
  // database level (on delete cascade), so this is genuinely
  // destructive — the confirmation dialog on the client is the only
  // guard before this point, which is why every delete is logged.
  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Could not delete this item." }, { status: 500 });
  }

  await logAdminAction({
    actorId: auth.userId,
    action: `${entityType}_deleted`,
    targetType: entityType,
    targetId: id,
    details: typeof label === "string" ? label : undefined,
  });

  return NextResponse.json({ ok: true });
}
