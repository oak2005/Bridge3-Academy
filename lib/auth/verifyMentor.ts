import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

type VerifyResult =
  | { authorized: true; userId: string; role: "mentor" | "admin" }
  | { authorized: false; error: string; status: number };

/**
 * Verifies the caller is actually signed in AND has role 'mentor' or
 * 'admin' on their profile — checked fresh against the database every
 * call, not trusted from anything the client claims. This is the real
 * enforcement; the mentor pages' client-side redirect is just a UX nicety
 * on top of this, not a substitute for it.
 */
export async function verifyMentor(authHeader: string | null): Promise<VerifyResult> {
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return { authorized: false, error: "Not signed in.", status: 401 };
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return { authorized: false, error: "Not signed in.", status: 401 };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) {
    return { authorized: false, error: "You don't have access to this.", status: 403 };
  }

  return { authorized: true, userId: userData.user.id, role: profile.role };
}
