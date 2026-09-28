import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  isPlaceholderSupabase,
  findMockSignupByToken,
  confirmMockSignupEmail,
  mockSignups,
} from "@/lib/waitlist/mockStore";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;

  if (isPlaceholderSupabase()) {
    // If token provided, find by token, or just confirm the latest/first signup if token matches or is mock
    let signup = token ? findMockSignupByToken(token) : undefined;
    if (!signup && mockSignups && mockSignups.size > 0) {
      signup = Array.from(mockSignups.values())[mockSignups.size - 1];
    }
    if (signup) {
      confirmMockSignupEmail(signup.id);
      return NextResponse.redirect(`${siteUrl}/waitlist?id=${signup.id}&confirmed=true`);
    }
  }

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
