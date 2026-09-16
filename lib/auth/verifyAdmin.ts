import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

type VerifyResult =
  | { authorized: true; userId: string }
  | { authorized: false; error: string; status: number };

/**
 * Verifies the caller is signed in AND has role 'admin' AND is still
 * active — checked fresh against the database on every request. This is
 * the real enforcement for every admin route; the page-level redirect is
 * only a UX nicety on top of it.
 */
export async function verifyAdmin(authHeader: string | null): Promise<VerifyResult> {
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return { authorized: false, error: "Not found.", status: 404 };
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return { authorized: false, error: "Not found.", status: 404 };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, is_active")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || !profile.is_active) {
    // Deliberately returns 404 rather than 403 — a non-admin shouldn't
    // even be able to confirm this route exists.
    return { authorized: false, error: "Not found.", status: 404 };
  }

  return { authorized: true, userId: userData.user.id };
}

/** Records an admin action in the audit log. Best-effort — never blocks the action itself. */
export async function logAdminAction(params: {
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
}) {
  try {
    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: params.actorId,
      action: params.action,
      target_type: params.targetType || null,
      target_id: params.targetId || null,
      details: params.details || null,
    });
  } catch {
    // Intentionally swallowed: a logging failure shouldn't undo a
    // legitimate admin action that already succeeded.
  }
}
