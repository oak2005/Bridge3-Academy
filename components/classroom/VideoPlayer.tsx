"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// YouTube URL parsing — handles all known formats
// ---------------------------------------------------------------------------

interface YouTubeInfo {
  videoId: string;
  startSeconds: number | null;
}

function parseYouTubeUrl(url: string): YouTubeInfo | null {
  // Normalise the URL
  let normalized = url.trim();
  if (!normalized.startsWith("http")) normalized = `https://${normalized}`;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return null;
  }

  const hostname = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");

  // Must be a YouTube domain
  const ytHosts = [
    "youtube.com",
    "youtu.be",
    "youtube-nocookie.com",
  ];
  if (!ytHosts.some((h) => hostname === h || hostname.endsWith(`.${h}`))) {
    return null;
  }

  let videoId: string | null = null;

  // youtu.be/<id>
  if (hostname === "youtu.be") {
    videoId = parsed.pathname.slice(1).split("/")[0] || null;
  }
  // /watch?v=<id>
  else if (parsed.pathname === "/watch") {
    videoId = parsed.searchParams.get("v");
  }
  // /embed/<id>
  else if (parsed.pathname.startsWith("/embed/")) {
    videoId = parsed.pathname.split("/")[2] || null;
  }
  // /shorts/<id>
  else if (parsed.pathname.startsWith("/shorts/")) {
    videoId = parsed.pathname.split("/")[2] || null;
  }
  // /live/<id>
  else if (parsed.pathname.startsWith("/live/")) {
    videoId = parsed.pathname.split("/")[2] || null;
  }
  // /v/<id> (old format)
  else if (parsed.pathname.startsWith("/v/")) {
    videoId = parsed.pathname.split("/")[2] || null;
  }

  if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;

  // Parse start time from ?t=, &t=, or &start= parameters
  const startSeconds = parseStartTime(parsed);

  return { videoId, startSeconds };
}

/**
 * Parses YouTube start time from URL parameters.
 * Handles: t=90, t=1m30s, t=1h2m3s, start=90
 */
function parseStartTime(url: URL): number | null {
  const raw = url.searchParams.get("t") || url.searchParams.get("start");
  if (!raw) return null;

  // Pure number: seconds
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);

  // Time format: 1h2m3s, 1m30s, 90s
  let seconds = 0;
  const hours = raw.match(/(\d+)h/);
  const minutes = raw.match(/(\d+)m/);
  const secs = raw.match(/(\d+)s/);

  if (hours) seconds += parseInt(hours[1], 10) * 3600;
  if (minutes) seconds += parseInt(minutes[1], 10) * 60;
  if (secs) seconds += parseInt(secs[1], 10);

  return seconds > 0 ? seconds : null;
}

function buildYouTubeEmbedUrl(info: YouTubeInfo): string {
  let url = `https://www.youtube-nocookie.com/embed/${info.videoId}`;
  if (info.startSeconds) {
    url += `?start=${info.startSeconds}`;
  }
  return url;
}

function getYouTubeWatchUrl(info: YouTubeInfo): string {
  let url = `https://www.youtube.com/watch?v=${info.videoId}`;
  if (info.startSeconds) {
    url += `&t=${info.startSeconds}`;
  }
  return url;
}

// ---------------------------------------------------------------------------
// Vimeo URL parsing
// ---------------------------------------------------------------------------

interface VimeoInfo {
  videoId: string;
  hash: string | null;
}

function parseVimeoUrl(url: string): VimeoInfo | null {
  let normalized = url.trim();
  if (!normalized.startsWith("http")) normalized = `https://${normalized}`;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return null;
  }

  const hostname = parsed.hostname.replace(/^www\./, "");
  if (hostname !== "vimeo.com" && hostname !== "player.vimeo.com") {
    return null;
  }

  // player.vimeo.com/video/<id>
  if (hostname === "player.vimeo.com") {
    const parts = parsed.pathname.split("/");
    const idx = parts.indexOf("video");
    if (idx >= 0 && parts[idx + 1]) {
      const videoId = parts[idx + 1];
      const hash = parsed.searchParams.get("h") || parts[idx + 2] || null;
      return { videoId, hash };
    }
    return null;
  }

  // vimeo.com/<id> or vimeo.com/<id>/<hash>
  const match = parsed.pathname.match(/^\/(\d+)(?:\/([a-f0-9]+))?/);
  if (match) {
    return { videoId: match[1], hash: match[2] || null };
  }

  return null;
}

function buildVimeoEmbedUrl(info: VimeoInfo): string {
  let url = `https://player.vimeo.com/video/${info.videoId}`;
  if (info.hash) {
    url += `?h=${info.hash}`;
  }
  return url;
}

// ---------------------------------------------------------------------------
// Direct video file detection
// ---------------------------------------------------------------------------

function isDirectVideoUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return pathname.endsWith(".mp4") || pathname.endsWith(".webm");
  } catch {
    // Try without protocol
    return url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm");
  }
}

// ---------------------------------------------------------------------------
// VideoPlayer component
// ---------------------------------------------------------------------------

export function VideoPlayer({ videoUrl }: { videoUrl: string | null }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded border border-dashed border-border bg-paper-raised">
        <p className="text-sm text-ink-muted">No video attached to this lesson yet.</p>
      </div>
    );
  }

  const ytInfo = parseYouTubeUrl(videoUrl);
  const vimeoInfo = !ytInfo ? parseVimeoUrl(videoUrl) : null;
  const isDirect = !ytInfo && !vimeoInfo && isDirectVideoUrl(videoUrl);

  // YouTube embed
  if (ytInfo) {
    const embedUrl = buildYouTubeEmbedUrl(ytInfo);
    const watchUrl = getYouTubeWatchUrl(ytInfo);

    return (
      <div>
        <div className="relative aspect-video overflow-hidden rounded border border-border bg-black">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-paper-raised">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          )}
          <iframe
            src={embedUrl}
            title="Lesson video"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        </div>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <span>Open on YouTube ↗</span>
        </a>
      </div>
    );
  }

  // Vimeo embed
  if (vimeoInfo) {
    const embedUrl = buildVimeoEmbedUrl(vimeoInfo);

    return (
      <div>
        <div className="relative aspect-video overflow-hidden rounded border border-border bg-black">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-paper-raised">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          )}
          <iframe
            src={embedUrl}
            title="Lesson video"
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        </div>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <span>Open on Vimeo ↗</span>
        </a>
      </div>
    );
  }

  // Direct video file (.mp4, .webm)
  if (isDirect) {
    return (
      <div className="relative aspect-video overflow-hidden rounded border border-border bg-black">
        <video
          controls
          className="h-full w-full"
          onLoadedData={() => setLoaded(true)}
          onError={() => setError(true)}
        >
          <source src={videoUrl} />
          Your browser doesn&rsquo;t support embedded video.
        </video>
      </div>
    );
  }

  // Unrecognised or broken URL — friendly fallback
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded border border-dashed border-border bg-paper-raised">
      <p className="text-sm text-ink-muted">
        This video link couldn&rsquo;t be embedded.
      </p>
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded border border-border px-4 py-2 text-sm font-medium text-accent-hover hover:border-accent transition-colors"
      >
        Open link in a new tab ↗
      </a>
    </div>
  );
}

// Re-export for use in admin preview
export { parseYouTubeUrl, parseVimeoUrl, isDirectVideoUrl };
