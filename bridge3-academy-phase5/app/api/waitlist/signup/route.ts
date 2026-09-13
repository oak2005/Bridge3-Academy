import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendWaitlistConfirmationEmail } from "@/lib/email/resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const referredBy = typeof body?.referredBy === "string" ? body.referredBy : null;

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Reuse an existing row instead of erroring, so someone who already
  // joined can just get redirected straight to their dashboard.
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id, email_confirmed, confirmation_token")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  let signupId: string;
  let confirmationToken: string;
  let alreadyConfirmed = false;

  if (existing) {
    signupId = existing.id;
    confirmationToken = existing.confirmation_token;
    alreadyConfirmed = existing.email_confirmed;
  } else {
    // Referral attribution only happens on first insert (first-touch), and
    // only if the referrer is a real signup and not the same person.
    let validatedReferrer: string | null = null;
    if (referredBy) {
      const { data: referrer } = await supabaseAdmin
        .from("waitlist_signups")
        .select("id")
        .eq("id", referredBy)
        .maybeSingle();
      if (referrer) validatedReferrer = referrer.id;
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("waitlist_signups")
      .insert({ email, referred_by: validatedReferrer })
      .select("id, confirmation_token")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
    }
    signupId = inserted.id;
    confirmationToken = inserted.confirmation_token;
  }

  if (!alreadyConfirmed) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const confirmUrl = `${siteUrl}/api/waitlist/confirm-email?token=${confirmationToken}`;
    try {
      await sendWaitlistConfirmationEmail(email, confirmUrl);
    } catch {
      // Signup still succeeds even if the email send fails — the person
      // can use "Resend confirmation email" from the dashboard.
    }
  }

  return NextResponse.json({ id: signupId, alreadyConfirmed });
}
