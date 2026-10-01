import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PublicWaitlistTask, DEFAULT_TASKS } from "@/lib/waitlist/tasks";
import { isPlaceholderSupabase, getMockTasks } from "@/lib/waitlist/mockStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
    Pragma: "no-cache",
  };

  try {
    if (isPlaceholderSupabase()) {
      const fallback = getMockTasks().filter((t) => t.isActive !== false);
      return NextResponse.json({ tasks: fallback }, { headers });
    }

    const { data, error } = await supabaseAdmin
      .from("waitlist_tasks")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      const fallback = getMockTasks().filter((t) => t.isActive !== false);
      return NextResponse.json({ tasks: fallback }, { headers });
    }

    const tasks: PublicWaitlistTask[] = data.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      actionUrl: t.action_url || null,
      actionLabel: t.action_label || null,
      inputType: (t.input_type as PublicWaitlistTask["inputType"]) || "username",
      inputPlaceholder: t.input_placeholder || null,
      weight: Number(t.weight) || 25,
      isSystem: Boolean(t.is_system),
      displayOrder: Number(t.display_order) || 0,
    }));

    return NextResponse.json({ tasks }, { headers });
  } catch (err) {
    console.error("Failed to load waitlist tasks:", err);
    const fallback = getMockTasks().filter((t) => t.isActive !== false);
    return NextResponse.json({ tasks: fallback }, { headers });
  }
}

