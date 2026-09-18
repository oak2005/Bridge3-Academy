import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/auth/verifyAdmin";
import { jsonNoStore } from "@/lib/http/noStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: entries } = await supabaseAdmin
    .from("admin_audit_log")
    .select("id, actor_id, action, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const actorIds = Array.from(new Set((entries || []).map((e) => e.actor_id)));
  const { data: actors } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name")
    .in("id", actorIds.length > 0 ? actorIds : ["00000000-0000-0000-0000-000000000000"]);
  const nameById = new Map((actors || []).map((a) => [a.id, a.full_name || "Admin"]));

  const log = (entries || []).map((e) => ({
    id: e.id,
    actorName: nameById.get(e.actor_id) || "Admin",
    action: e.action,
    targetType: e.target_type,
    targetId: e.target_id,
    details: e.details,
    createdAt: e.created_at,
  }));

  return jsonNoStore({ log });
}
