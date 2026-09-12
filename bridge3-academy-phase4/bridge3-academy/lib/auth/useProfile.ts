"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  university: string | null;
  role_interest: "developer" | "growth" | "creative" | "operations" | null;
  role: "student" | "mentor" | "admin";
  level: "beginner" | "intermediate" | "advanced" | null;
  track: "growth" | "creative" | "operations" | "engineering" | null;
  onboarding_completed: boolean;
}

interface UseProfileResult {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  refresh: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  async function loadProfile(currentSession: Session | null) {
    if (!currentSession) {
      setProfile(null);
      return;
    }
    const { data } = await supabaseBrowser
      .from("profiles")
      .select("*")
      .eq("id", currentSession.user.id)
      .maybeSingle();
    setProfile((data as Profile) || null);
  }

  async function refresh() {
    const { data } = await supabaseBrowser.auth.getSession();
    setSession(data.session);
    await loadProfile(data.session);
  }

  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await loadProfile(data.session);
      setLoading(false);
    })();

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        await loadProfile(newSession);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { loading, session, profile, refresh };
}
