import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { certificateAdapter } from "@/lib/certificates/adapter";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: "Certificate ID required." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const result = await certificateAdapter.verifyCertificate(supabaseAdmin, id);

  if (!result.valid || !result.certificate) {
    return NextResponse.json(
      { valid: false, error: result.error || "Certificate not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      valid: true,
      certificate: result.certificate,
      student: result.student,
      track: result.track,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
