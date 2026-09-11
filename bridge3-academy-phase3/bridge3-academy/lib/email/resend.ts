import "server-only";
import { Resend } from "resend";

// SERVER-ONLY. Resend is the email provider — see README for why it was
// chosen (free tier, no session/cookie complexity, reusable later for
// mentor notifications and certificate emails).
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.WAITLIST_EMAIL_FROM || "Bridge3 Academy <onboarding@resend.dev>";

export async function sendWaitlistConfirmationEmail(
  toEmail: string,
  confirmUrl: string
) {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "Confirm your email — Bridge3 Academy",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#1C2A22;">You're almost on the list</h2>
        <p style="color:#3A473F;">
          Click below to confirm your email and complete this step of your
          verification checklist.
        </p>
        <p style="margin: 24px 0;">
          <a href="${confirmUrl}"
             style="background:#3E9A5C;color:#ffffff;padding:12px 20px;
                    border-radius:6px;text-decoration:none;font-weight:600;">
            Confirm my email
          </a>
        </p>
        <p style="color:#5C6B60;font-size:13px;">
          If the button doesn't work, paste this link into your browser:<br />
          ${confirmUrl}
        </p>
      </div>
    `,
  });
}
