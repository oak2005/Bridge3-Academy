import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/auth/verifyAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: tracks } = await supabaseAdmin
    .from("tracks")
    .select("id, slug, title, description, track_type, order_index, coming_soon")
    .order("order_index", { ascending: true });

  const { data: modules } = await supabaseAdmin
    .from("modules")
    .select("id, track_id, title, description, order_index")
    .order("order_index", { ascending: true });

  const { data: lessons } = await supabaseAdmin
    .from("lessons")
    .select("id, module_id, title, video_url, duration_minutes, order_index")
    .order("order_index", { ascending: true });

  return NextResponse.json({
    tracks: tracks || [],
    modules: modules || [],
    lessons: lessons || [],
  });
}
