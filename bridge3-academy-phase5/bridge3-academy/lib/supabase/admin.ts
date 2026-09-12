import "server-only";
import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY. This uses the service role key, which bypasses Row Level
// Security entirely. It must only ever be imported inside app/api/*
// route handlers (or other server-only code) — never in a "use client"
// component, and never sent to the browser. The `server-only` import
// above will cause a build error if this file is ever accidentally
// imported into client code, as a safety net.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
);
