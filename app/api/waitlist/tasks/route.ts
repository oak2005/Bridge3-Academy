import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PublicWaitlistTask, DEFAULT_TASKS } from "@/lib/waitlist/tasks";
import { isPlaceholderSupabase, getMockTasks } from "@/lib/waitlist/mockStore";

export const dynamic = "force-dynamic";

async function ensureWaitlistTasksSeeded() {
  if (isPlaceholderSupabase()) return;
  try {
    const { count, error } = await supabaseAdmin
      .from("waitlist_tasks")
      .select("*", { count: "exact", head: true });

    if (!error && (count === 0 || count === null)) {
      for (const t of DEFAULT_TASKS) {
        await supabaseAdmin.from("waitlist_tasks").upsert({
          id: t.id,
          title: t.title,
          description: t.description,
          action_url: t.actionUrl,
          action_label: t.actionLabel,
          input_type: t.inputType,
          input_placeholder: t.inputPlaceholder,
          weight: t.weight,
          is_active: true,
          is_system: t.isSystem,
          display_order: t.displayOrder,
        });
      }
    }
  } catch (err) {
    console.warn("Could not check/seed waitlist_tasks in Supabase:", err);
  }
}

export async function GET() {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    Pragma: "no-cache",
  };

  try {
    if (!isPlaceholderSupabase()) {
      await ensureWaitlistTasksSeeded();
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

