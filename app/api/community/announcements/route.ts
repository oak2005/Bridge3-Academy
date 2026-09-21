import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data: announcements, error } = await supabaseAdmin
    .from("community_announcements")
    .select("id, author_id, title, content, category, pinned, created_at")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    return NextResponse.json(
      { error: "Failed to load announcements." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Fetch author names for display
  const authorIds = Array.from(new Set((announcements || []).map((a) => a.author_id).filter(Boolean)));
  let authorMap: Record<string, string> = {};

  if (authorIds.length > 0) {
    const { data: authors } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .in("id", authorIds);
    authorMap = (authors || []).reduce((acc, a) => {
      acc[a.id] = a.full_name || "Bridge3 Team";
      return acc;
    }, {} as Record<string, string>);
  }

  const result = (announcements || []).map((a) => ({
    ...a,
    authorName: a.author_id ? authorMap[a.author_id] || "Bridge3 Team" : "Bridge3 Team",
  }));

  return NextResponse.json(
    { announcements: result },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Verify mentor or admin
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, is_active")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile || !profile.is_active || (profile.role !== "mentor" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { title, content, category, pinned } = body || {};

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  const validCategories = ["general", "workshop", "hackathon", "ama", "update"];
  const safeCategory = validCategories.includes(category) ? category : "general";

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("community_announcements")
    .insert({
      author_id: userData.user.id,
      title: title.trim(),
      content: content.trim(),
      category: safeCategory,
      pinned: Boolean(pinned),
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Could not publish announcement." }, { status: 500 });
  }

  return NextResponse.json({ announcement: inserted }, { status: 201 });
}
