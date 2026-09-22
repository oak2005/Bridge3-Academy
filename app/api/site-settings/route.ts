import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DEFAULT_SITE_SETTINGS } from "@/lib/settings/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("id", "default_settings")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ settings: DEFAULT_SITE_SETTINGS });
    }

    return NextResponse.json({
      settings: {
        logoText: data.logo_text || DEFAULT_SITE_SETTINGS.logoText,
        logoUrl: data.logo_url || "",
        heroHeadline: data.hero_headline || DEFAULT_SITE_SETTINGS.heroHeadline,
        heroSubheadline: data.hero_subheadline || DEFAULT_SITE_SETTINGS.heroSubheadline,
        heroCtaText: data.hero_cta_text || DEFAULT_SITE_SETTINGS.heroCtaText,
        heroAnnouncement: data.hero_announcement || DEFAULT_SITE_SETTINGS.heroAnnouncement,
        illustrationUrl: data.illustration_url || "",
        illustrationCaption: data.illustration_caption || DEFAULT_SITE_SETTINGS.illustrationCaption,
      },
    });
  } catch (err) {
    console.error("Failed to load site settings:", err);
    return NextResponse.json({ settings: DEFAULT_SITE_SETTINGS });
  }
}
