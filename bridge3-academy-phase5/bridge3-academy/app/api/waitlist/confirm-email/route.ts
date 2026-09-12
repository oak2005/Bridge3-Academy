import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/waitlist?error=missing_token`);
  }

  const { data: row, error } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id")
    .eq("confirmation_token", token)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.redirect(`${siteUrl}/waitlist?error=invalid_token`);
  }

  await supabaseAdmin
    .from("waitlist_signups")
    .update({ email_confirmed: true })
    .eq("id", row.id);

  return NextResponse.redirect(`${siteUrl}/waitlist?id=${row.id}&confirmed=true`);
}
