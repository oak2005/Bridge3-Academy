"use client";

import { useState, useEffect, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface AudioPlayerProps {
  notes: string;
  audioPath?: string | null;
  lessonTitle: string;
}

const SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];

export function AudioPlayer({ notes, audioPath, lessonTitle }: AudioPlayerProps) {
  const [mode, setMode] = useState<"read" | "listen">("read");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // HTML5 audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Web Speech fallback state
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynthesisAvailable(true);
    }
  }, []);

  // Fetch or construct public URL if audioPath is provided
  useEffect(() => {
    if (!audioPath) {
      setAudioUrl(null);
      return;
    }
    const { data } = supabaseBrowser.storage.from("lesson-audio").getPublicUrl(audioPath);
    if (data?.publicUrl) {
      setAudioUrl(data.publicUrl);
    }
  }, [audioPath]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle Play/Pause
  function handleTogglePlay() {
    if (audioUrl) {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.playbackRate = speed;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else if (speechSynthesisAvailable) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.cancel(); // Stop any pending
        const cleanText = notes.replace(/[#*_`~>-]/g, " ").trim();
        const utt = new SpeechSynthesisUtterance(cleanText);
        utt.rate = speed;
        utt.onend = () => setIsPlaying(false);
        utt.onerror = () => setIsPlaying(false);
        utteranceRef.current = utt;
        window.speechSynthesis.speak(utt);
        setIsPlaying(true);
      }
    }
  }

  function handleSpeedChange(newSpeed: number) {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
    if (speechSynthesisAvailable && isPlaying) {
      // Re-trigger speech synthesis with new rate
      window.speechSynthesis.cancel();
      const cleanText = notes.replace(/[#*_`~>-]/g, " ").trim();
      const utt = new SpeechSynthesisUtterance(cleanText);
      utt.rate = newSpeed;
      utt.onend = () => setIsPlaying(false);
      utt.onerror = () => setIsPlaying(false);
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    }
  }

  function handleSeek(seconds: number) {
    if (audioRef.current) {
      const nextTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  }

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-paper-raised p-6 shadow-sm">
      {/* Read / Listen toggle tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex rounded-lg bg-paper p-1 border border-border">
          <button
            type="button"
            onClick={() => setMode("read")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === "read"
                ? "bg-accent text-accent-contrast shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <span>📖</span>
            <span>Read Notes</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("listen")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === "listen"
                ? "bg-accent text-accent-contrast shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <span>🎧</span>
            <span>Listen (Audio)</span>
          </button>
        </div>

        {mode === "listen" && (
          <span className="rounded-full border border-accent/30 bg-accent-tint px-2.5 py-1 text-[11px] font-medium text-accent">
            {audioUrl ? "🎙️ High Quality Audio" : "🔊 Browser Voice"}
          </span>
        )}
      </div>

      {/* Mode: Read */}
      {mode === "read" && (
        <div className="mt-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
            {notes || "No written notes for this lesson yet."}
          </p>
        </div>
      )}

      {/* Mode: Listen */}
      {mode === "listen" && (
        <div className="mt-4 flex flex-col gap-4">
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={() => {
                if (audioRef.current) {
                  setCurrentTime(audioRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setDuration(audioRef.current.duration);
                }
              }}
              onEnded={() => setIsPlaying(false)}
            />
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-muted">Audio narration for:</p>
              <h4 className="text-sm font-semibold text-ink">{lessonTitle}</h4>
            </div>
            <div className="flex items-center gap-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpeedChange(s)}
                  className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                    speed === s
                      ? "bg-accent text-accent-contrast"
                      : "text-ink-muted hover:bg-paper hover:text-ink"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Audio progress bar for HTML5 audio */}
          {audioUrl && duration > 0 && (
            <div className="flex flex-col gap-1">
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={handleSliderChange}
                className="w-full accent-accent h-1.5 cursor-pointer bg-border rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-ink-muted">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Player controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            {audioUrl && (
              <button
                type="button"
                onClick={() => handleSeek(-10)}
                className="rounded-full border border-border p-2 text-xs text-ink-soft hover:bg-paper hover:text-ink transition-colors"
                title="Rewind 10 seconds"
              >
                ↺ -10s
              </button>
            )}

            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-contrast shadow-md hover:bg-accent-hover transition-transform active:scale-95"
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
            >
              {isPlaying ? (
                <span className="text-base font-bold">⏸</span>
              ) : (
                <span className="ml-0.5 text-base font-bold">▶</span>
              )}
            </button>

            {audioUrl && (
              <button
                type="button"
                onClick={() => handleSeek(10)}
                className="rounded-full border border-border p-2 text-xs text-ink-soft hover:bg-paper hover:text-ink transition-colors"
                title="Forward 10 seconds"
              >
                +10s ↻
              </button>
            )}
          </div>

          {!audioUrl && !speechSynthesisAvailable && (
            <p className="text-center text-xs text-ink-muted">
              Audio playback is not supported by your current browser.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
