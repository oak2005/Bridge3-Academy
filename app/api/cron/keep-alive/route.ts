import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/keep-alive
 *
 * Lightweight heartbeat that prevents the Supabase free-tier project from
 * pausing due to inactivity (pauses after 7 days with no API calls).
 *
 * This route is designed to be called by an external cron scheduler
 * (Vercel Cron, GitHub Actions, cron-job.org, etc.) every few days.
 *
 * It runs a cheap count query on the database and returns a timestamp so
 * you can verify it ran from the Vercel function logs.
 *
 * Protected by a shared secret (`CRON_SECRET`) so it cannot be abused
 * by random visitors. If the secret is not configured, the route still
 * works (useful during development) but logs a warning.
 */
export async function GET(req: NextRequest) {
  // ── Auth: verify shared secret if configured ──
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn(
      "[keep-alive] CRON_SECRET is not set. Add it to your environment " +
        "variables for production security."
    );
  }

  // ── Ping Supabase with a minimal query ──
  // A head-only count query is the cheapest possible database interaction.
  const { error } = await supabaseAdmin
    .from("waitlist_signups")
    .select("id", { count: "exact", head: true });

  const now = new Date().toISOString();

  if (error) {
    console.error("[keep-alive] Supabase ping failed:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message, timestamp: now },
      { status: 500 }
    );
  }

  console.log(`[keep-alive] Supabase pinged successfully at ${now}`);
  return NextResponse.json({ ok: true, timestamp: now });
}
