import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin, logAdminAction } from "@/lib/auth/verifyAdmin";
import { DEFAULT_TASKS } from "@/lib/waitlist/tasks";
import {
  isPlaceholderSupabase,
  getMockTasks,
  reorderMockTasks,
  createMockTask,
  updateMockTask,
  deleteMockTask,
} from "@/lib/waitlist/mockStore";

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

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (isPlaceholderSupabase()) {
    const tasks = getMockTasks().map((t) => ({
      ...t,
      isActive: t.isActive !== false,
    }));
    return NextResponse.json({ tasks });
  }

  await ensureWaitlistTasksSeeded();

  const { data, error } = await supabaseAdmin
    .from("waitlist_tasks")
    .select("*")
    .order("display_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return NextResponse.json({ tasks: getMockTasks().map((t) => ({ ...t, isActive: t.isActive !== false })) });
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

    // Always sync into mock store
    createMockTask({
      id: taskId,
      title: task.title.trim(),
      description: task.description.trim(),
      actionUrl: task.actionUrl?.trim() || null,
      actionLabel: task.actionLabel?.trim() || null,
      inputType: task.inputType || "username",
      inputPlaceholder: task.inputPlaceholder?.trim() || null,
      weight: Number(task.weight) || 25,
      isSystem: false,
      displayOrder: Number(task.displayOrder) || 10,
      isActive: task.isActive !== false,
    });

    if (!isPlaceholderSupabase()) {
      const { error } = await supabaseAdmin.from("waitlist_tasks").upsert({
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
        console.error("Failed to create task in Supabase:", error);
      }
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

    // Always sync into mock store
    updateMockTask({
      id: task.id,
      title: task.title.trim(),
      description: task.description?.trim() || "",
      actionUrl: task.actionUrl?.trim() || null,
      actionLabel: task.actionLabel?.trim() || null,
      inputType: task.inputType || "username",
      inputPlaceholder: task.inputPlaceholder?.trim() || null,
      weight: Number(task.weight) || 25,
      isActive: Boolean(task.isActive),
      displayOrder: Number(task.displayOrder) || 0,
    });

    if (!isPlaceholderSupabase()) {
      const { error } = await supabaseAdmin
        .from("waitlist_tasks")
        .upsert({
          id: task.id,
          title: task.title.trim(),
          description: task.description?.trim() || "",
          action_url: task.actionUrl?.trim() || null,
          action_label: task.actionLabel?.trim() || null,
          input_type: task.inputType || "username",
          input_placeholder: task.inputPlaceholder?.trim() || null,
          weight: Number(task.weight) || 25,
          is_active: Boolean(task.isActive),
          display_order: Number(task.displayOrder) || 0,
        });

      if (error) {
        console.error("Failed to update task in Supabase:", error);
      }
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

    deleteMockTask(task.id);

    if (!isPlaceholderSupabase()) {
      const { error } = await supabaseAdmin.from("waitlist_tasks").delete().eq("id", task.id);
      if (error) {
        return NextResponse.json({ error: "Could not delete task." }, { status: 500 });
      }
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

    updateMockTask({ id: task.id, isActive: Boolean(task.isActive) });

    if (!isPlaceholderSupabase()) {
      const { error } = await supabaseAdmin
        .from("waitlist_tasks")
        .update({ is_active: Boolean(task.isActive) })
        .eq("id", task.id);

      if (error) {
        return NextResponse.json({ error: "Could not update task status." }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "reorder") {
    const orderedIds: string[] = body.orderedIds || [];
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: "Missing or invalid orderedIds array." }, { status: 400 });
    }

    if (isPlaceholderSupabase()) {
      reorderMockTasks(orderedIds);
      return NextResponse.json({ ok: true });
    }

    // Persist new display order for each task in Supabase
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      await supabaseAdmin
        .from("waitlist_tasks")
        .update({ display_order: i + 1 })
        .eq("id", id);
    }

    await logAdminAction({
      actorId: auth.userId,
      action: "reordered_waitlist_tasks",
      targetType: "waitlist_task",
      targetId: "all",
      details: `Reordered ${orderedIds.length} waitlist tasks display sequence`,
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
