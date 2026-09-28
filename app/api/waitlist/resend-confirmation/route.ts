import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendWaitlistConfirmationEmail } from "@/lib/email/resend";
import { isPlaceholderSupabase, findMockSignupById } from "@/lib/waitlist/mockStore";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (isPlaceholderSupabase()) {
    const signup = findMockSignupById(id);
    if (!signup) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (signup.email_confirmed) {
      return NextResponse.json({ ok: true, alreadyConfirmed: true });
    }
    return NextResponse.json({ ok: true });
  }

  const { data: signup } = await supabaseAdmin
    .from("waitlist_signups")
    .select("email, email_confirmed, confirmation_token")
    .eq("id", id)
    .maybeSingle();

  if (!signup) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (signup.email_confirmed) {
    return NextResponse.json({ ok: true, alreadyConfirmed: true });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const confirmUrl = `${siteUrl}/api/waitlist/confirm-email?token=${signup.confirmation_token}`;

  try {
    await sendWaitlistConfirmationEmail(signup.email, confirmUrl);
  } catch {
    return NextResponse.json({ error: "Could not send email. Try again shortly." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
