import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { certificateAdapter } from "@/lib/certificates/adapter";

export async function POST(req: NextRequest) {
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
  const studentId = userData.user.id;

  // Verify account is active
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, is_active")
    .eq("id", studentId)
    .maybeSingle();

  if (!profile || profile.is_active === false) {
    return NextResponse.json(
      { error: "This account is inactive." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const body = await req.json().catch(() => null);
  const trackId = body?.trackId as string | undefined;

  if (!trackId) {
    return NextResponse.json(
      { error: "Missing track ID." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Issue certificate through the adapter
  const result = await certificateAdapter.issueCertificate(supabaseAdmin, {
    studentId,
    trackId,
    studentName: profile.full_name || undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error || "Cannot issue certificate.",
        completionReport: result.completionReport,
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { certificate: result.certificate },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
