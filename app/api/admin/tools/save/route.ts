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
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { entityType, id, fields } = body;

  if (entityType === "category") {
    const { name, slug, description } = fields || {};
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
    }

    if (id) {
      const { error } = await supabaseAdmin
        .from("tool_categories")
        .update({ name, slug, description: description || null })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAdminAction({
        actorId: auth.userId,
        action: "tool_category_updated",
        targetType: "tool_category",
        targetId: id,
        details: name,
      });
    } else {
      const { data, error } = await supabaseAdmin
        .from("tool_categories")
        .insert({ name, slug, description: description || null })
        .select("id")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAdminAction({
        actorId: auth.userId,
        action: "tool_category_created",
        targetType: "tool_category",
        targetId: data.id,
        details: name,
      });
    }

    return NextResponse.json({ ok: true });
  }

  if (entityType === "tool") {
    const {
      category_id,
      name,
      description,
      url,
      logo_url,
      is_featured,
      is_published,
      pricing_type,
      difficulty,
      tags,
    } = fields || {};

    if (!name || !url || !category_id) {
      return NextResponse.json(
        { error: "Name, URL, and category are required." },
        { status: 400 }
      );
    }

    const payload = {
      category_id,
      name,
      description: description || "",
      url,
      logo_url: logo_url || null,
      is_featured: !!is_featured,
      is_published: is_published !== false,
      pricing_type: pricing_type || "free",
      difficulty: difficulty || "beginner",
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    };

    if (id) {
      const { error } = await supabaseAdmin
        .from("tools")
        .update(payload)
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAdminAction({
        actorId: auth.userId,
        action: "tool_updated",
        targetType: "tool",
        targetId: id,
        details: name,
      });
    } else {
      const { data, error } = await supabaseAdmin
        .from("tools")
        .insert(payload)
        .select("id")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAdminAction({
        actorId: auth.userId,
        action: "tool_created",
        targetType: "tool",
        targetId: data.id,
        details: name,
      });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unsupported entityType" }, { status: 400 });
}
