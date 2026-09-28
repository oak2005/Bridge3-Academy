import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin, logAdminAction } from "@/lib/auth/verifyAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  const { entityType, id, label } = body || {};

  if (!id || !["tool", "category"].includes(entityType)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const table = entityType === "category" ? "tool_categories" : "tools";

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
