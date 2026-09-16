import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin, logAdminAction } from "@/lib/auth/verifyAdmin";

const VALID_ROLES = ["student", "mentor", "admin"];

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  const { userId, role, isActive } = body || {};

  if (!userId) {
    return NextResponse.json({ error: "Missing user." }, { status: 400 });
  }
  if (role !== undefined && !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const { data: target } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Guardrail: never allow the platform to end up with zero active
  // admins. Without this, an admin could demote or deactivate the last
  // remaining admin (including themselves) and permanently lock everyone
  // out of this panel with no way back in through the app.
  const losingAdmin =
    target.role === "admin" && ((role !== undefined && role !== "admin") || isActive === false);

  if (losingAdmin) {
    const { count: activeAdmins } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("is_active", true);

    if ((activeAdmins || 0) <= 1) {
      return NextResponse.json(
        { error: "This is the last active admin — promote another admin first." },
        { status: 400 }
      );
    }
  }

  const updates: Record<string, unknown> = {};
  if (role !== undefined) updates.role = role;
  if (isActive !== undefined) updates.is_active = isActive;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("profiles").update(updates).eq("id", userId);
  if (error) {
    return NextResponse.json({ error: "Could not update user." }, { status: 500 });
  }

  if (role !== undefined && role !== target.role) {
    await logAdminAction({
      actorId: auth.userId,
      action: "role_change",
      targetType: "profile",
      targetId: userId,
      details: `${target.full_name || "User"}: ${target.role} → ${role}`,
    });
  }
  if (isActive !== undefined && isActive !== target.is_active) {
    await logAdminAction({
      actorId: auth.userId,
      action: isActive ? "account_reactivated" : "account_deactivated",
      targetType: "profile",
      targetId: userId,
      details: target.full_name || "User",
    });
  }

  return NextResponse.json({ ok: true });
}
