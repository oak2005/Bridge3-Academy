import { createClient } from "@supabase/supabase-js";

// Safe for the browser: uses only the public URL and anon key. RLS on every
// table decides what this key is actually allowed to do — see
// supabase/schema.sql for what's open (storage uploads) vs closed
// (waitlist tables, which are server-only).
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
