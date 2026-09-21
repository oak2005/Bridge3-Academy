import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
  const userId = userData.user.id;

  const body = await req.json().catch(() => null);
  const { full_name, university, role_interest, track, level } = body || {};

  // Build clean payload of allowed editable fields
  const updates: Record<string, unknown> = {};
  if (typeof full_name === "string") updates.full_name = full_name.trim();
  if (typeof university === "string" || university === null) updates.university = university ? university.trim() : null;
  if (role_interest) updates.role_interest = role_interest;
  if (track) updates.track = track;
  if (level) updates.level = level;

  // Never allow role or is_active modification here
  delete updates.role;
  delete updates.is_active;

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message || "Failed to update profile." },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: updated });
}
