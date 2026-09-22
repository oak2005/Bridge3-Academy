import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PublicWaitlistTask, DEFAULT_TASKS } from "@/lib/waitlist/tasks";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("waitlist_tasks")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ tasks: DEFAULT_TASKS });
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

    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("Failed to load waitlist tasks:", err);
    return NextResponse.json({ tasks: DEFAULT_TASKS });
  }
}
