import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonNoStore } from "@/lib/http/noStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: categories, error: catErr } = await supabaseAdmin
    .from("tool_categories")
    .select("id, name, slug, description, order_index")
    .order("order_index", { ascending: true });

  if (catErr) {
    return NextResponse.json({ error: catErr.message }, { status: 500 });
  }

  const { data: tools, error: toolsErr } = await supabaseAdmin
    .from("tools")
    .select(
      "id, category_id, name, description, url, logo_url, is_featured, order_index, pricing_type, difficulty, tags"
    )
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (toolsErr) {
    return NextResponse.json({ error: toolsErr.message }, { status: 500 });
  }

  return jsonNoStore({
    categories: categories || [],
    tools: tools || [],
  });
}
