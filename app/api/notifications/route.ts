import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json(
      { error: "Not signed in." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json(
      { error: "Not signed in." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }
  const userId = userData.user.id;

  const { data: notifications, error } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch notifications." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

  return NextResponse.json(
    { notifications: notifications || [], unreadCount },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json(
      { error: "Not signed in." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json(
      { error: "Not signed in." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }
  const userId = userData.user.id;

  const body = await req.json().catch(() => null);
  const { notificationId, markAllRead } = body || {};

  if (markAllRead) {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      return NextResponse.json({ error: "Failed to update notifications." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (notificationId) {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: "Failed to update notification." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid request parameters." }, { status: 400 });
}
