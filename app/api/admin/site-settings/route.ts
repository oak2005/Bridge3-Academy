import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin, logAdminAction } from "@/lib/auth/verifyAdmin";
import { DEFAULT_SITE_SETTINGS } from "@/lib/settings/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

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
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const {
    logoText,
    logoUrl,
    heroHeadline,
    heroSubheadline,
    heroCtaText,
    heroAnnouncement,
    illustrationUrl,
    illustrationCaption,
  } = body;

  const payload: Record<string, unknown> = {
    id: "default_settings",
    updated_at: new Date().toISOString(),
    updated_by: auth.userId,
  };

  if (logoText !== undefined) payload.logo_text = String(logoText).trim() || DEFAULT_SITE_SETTINGS.logoText;
  if (logoUrl !== undefined) payload.logo_url = String(logoUrl).trim();
  if (heroHeadline !== undefined) payload.hero_headline = String(heroHeadline).trim();
  if (heroSubheadline !== undefined) payload.hero_subheadline = String(heroSubheadline).trim();
  if (heroCtaText !== undefined) payload.hero_cta_text = String(heroCtaText).trim();
  if (heroAnnouncement !== undefined) payload.hero_announcement = String(heroAnnouncement).trim();
  if (illustrationUrl !== undefined) payload.illustration_url = String(illustrationUrl).trim();
  if (illustrationCaption !== undefined) payload.illustration_caption = String(illustrationCaption).trim();

  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error("Failed to update site settings:", error);
    return NextResponse.json(
      { error: "Could not save site settings. Ensure schema_redo_admin_and_cms.sql was run." },
      { status: 500 }
    );
  }

  await logAdminAction({
    actorId: auth.userId,
    action: "updated_site_settings",
    targetType: "site_settings",
    targetId: "default_settings",
    details: `Updated branding & hero configuration`,
  });

  return NextResponse.json({ ok: true });
}
