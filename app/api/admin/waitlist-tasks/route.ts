import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin, logAdminAction } from "@/lib/auth/verifyAdmin";
import { DEFAULT_TASKS } from "@/lib/waitlist/tasks";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await supabaseAdmin
    .from("waitlist_tasks")
    .select("*")
    .order("display_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return NextResponse.json({ tasks: DEFAULT_TASKS.map((t) => ({ ...t, isActive: true })) });
  }

  const tasks = data.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    actionUrl: t.action_url,
    actionLabel: t.action_label,
    inputType: t.input_type || "username",
    inputPlaceholder: t.input_placeholder,
    weight: t.weight,
    isActive: Boolean(t.is_active),
    isSystem: Boolean(t.is_system),
    displayOrder: t.display_order,
  }));

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.action) {
    return NextResponse.json({ error: "Missing action in request." }, { status: 400 });
  }

  const { action, task } = body;

  if (action === "create") {
    if (!task?.title || !task?.description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const taskId =
      task.id?.trim() ||
      task.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/(^_|_$)/g, "") + `_${Date.now().toString(36)}`;

    const { error } = await supabaseAdmin.from("waitlist_tasks").insert({
      id: taskId,
      title: task.title.trim(),
      description: task.description.trim(),
      action_url: task.actionUrl?.trim() || null,
      action_label: task.actionLabel?.trim() || null,
      input_type: task.inputType || "username",
      input_placeholder: task.inputPlaceholder?.trim() || null,
      weight: Number(task.weight) || 25,
      is_active: task.isActive !== false,
      is_system: false,
      display_order: Number(task.displayOrder) || 10,
    });

    if (error) {
      console.error("Failed to create task:", error);
      return NextResponse.json({ error: "Could not create task. Check if table exists." }, { status: 500 });
    }

    await logAdminAction({
      actorId: auth.userId,
      action: "created_waitlist_task",
      targetType: "waitlist_task",
      targetId: taskId,
      details: `Created task: ${task.title}`,
    });

    return NextResponse.json({ ok: true, taskId });
  }

  if (action === "update") {
    if (!task?.id || !task?.title) {
      return NextResponse.json({ error: "Task ID and title are required." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("waitlist_tasks")
      .update({
        title: task.title.trim(),
        description: task.description?.trim() || "",
        action_url: task.actionUrl?.trim() || null,
        action_label: task.actionLabel?.trim() || null,
        input_type: task.inputType || "username",
        input_placeholder: task.inputPlaceholder?.trim() || null,
        weight: Number(task.weight) || 25,
        is_active: Boolean(task.isActive),
        display_order: Number(task.displayOrder) || 0,
      })
      .eq("id", task.id);

    if (error) {
      return NextResponse.json({ error: "Could not update task." }, { status: 500 });
    }

    await logAdminAction({
      actorId: auth.userId,
      action: "updated_waitlist_task",
      targetType: "waitlist_task",
      targetId: task.id,
      details: `Updated task: ${task.title}`,
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    if (!task?.id) {
      return NextResponse.json({ error: "Task ID is required." }, { status: 400 });
    }

    // Protect system tasks from accidental deletion
    const { data: existing } = await supabaseAdmin
      .from("waitlist_tasks")
      .select("is_system, title")
      .eq("id", task.id)
      .maybeSingle();

    if (existing?.is_system) {
      return NextResponse.json({ error: "System tasks cannot be deleted." }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("waitlist_tasks").delete().eq("id", task.id);
    if (error) {
      return NextResponse.json({ error: "Could not delete task." }, { status: 500 });
    }

    await logAdminAction({
      actorId: auth.userId,
      action: "deleted_waitlist_task",
      targetType: "waitlist_task",
      targetId: task.id,
      details: `Deleted task: ${existing?.title || task.id}`,
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "toggle") {
    if (!task?.id) {
      return NextResponse.json({ error: "Task ID is required." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("waitlist_tasks")
      .update({ is_active: Boolean(task.isActive) })
      .eq("id", task.id);

    if (error) {
      return NextResponse.json({ error: "Could not update task status." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
