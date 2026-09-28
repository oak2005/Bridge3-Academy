import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdmin, logAdminAction } from "@/lib/auth/verifyAdmin";
import { getTTSProvider } from "@/lib/audio/ttsProvider";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  const auth = await verifyAdmin(req.headers.get("authorization"));
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { lessonId } = params;

  // 1. Fetch the lesson
  const { data: lesson, error: fetchErr } = await supabaseAdmin
    .from("lessons")
    .select("id, title, notes")
    .eq("id", lessonId)
    .maybeSingle();

  if (fetchErr || !lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  if (!lesson.notes || !lesson.notes.trim()) {
    return NextResponse.json(
      { error: "Lesson has no notes to convert to audio." },
      { status: 400 }
    );
  }

  // 2. Synthesize audio
  try {
    const provider = getTTSProvider();
    const cleanText = lesson.notes
      .replace(/[#*_`~>-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const { audioBuffer, contentType } = await provider.generateAudio(cleanText);

    // Compute hash of the notes for staleness tracking
    const hash = crypto.createHash("sha256").update(lesson.notes).digest("hex");
    const storagePath = `lessons/${lesson.id}.mp3`;

    // 3. Upload to Supabase Storage 'lesson-audio'
    const { error: uploadErr } = await supabaseAdmin.storage
      .from("lesson-audio")
      .upload(storagePath, audioBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // 4. Update lesson record
    const { error: updateErr } = await supabaseAdmin
      .from("lessons")
      .update({
        audio_path: storagePath,
        audio_generated_at: new Date().toISOString(),
        audio_notes_hash: hash,
      })
      .eq("id", lesson.id);

    if (updateErr) {
      return NextResponse.json(
        { error: `Database update failed: ${updateErr.message}` },
        { status: 500 }
      );
    }

    await logAdminAction({
      actorId: auth.userId,
      action: "generate_lesson_audio",
      targetType: "lesson",
      targetId: lesson.id,
      details: `${provider.name}:${storagePath}`,
    });

    return NextResponse.json({
      success: true,
      audioPath: storagePath,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "TTS generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
