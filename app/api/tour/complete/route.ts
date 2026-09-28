import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = userData.user.id;
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ tour_completed_at: now })
    .eq("id", userId);

  if (error) {
    // Graceful fallback if column hasn't been migrated in DB yet
    console.warn("Could not save tour_completed_at to profile:", error.message);
  }

  return NextResponse.json({ ok: true, completedAt: now });
}
