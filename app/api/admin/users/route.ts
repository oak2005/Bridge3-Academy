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

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, university, role, is_active, track, level, created_at")
    .order("created_at", { ascending: false });

  return jsonNoStore({ users: profiles || [] });
}
