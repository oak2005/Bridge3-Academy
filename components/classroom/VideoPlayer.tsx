function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([\w-]+)/,
    /youtu\.be\/([\w-]+)/,
    /youtube\.com\/embed\/([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

export function VideoPlayer({ videoUrl }: { videoUrl: string | null }) {
  if (!videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded border border-dashed border-border bg-paper-raised">
        <p className="text-sm text-ink-muted">No video attached to this lesson yet.</p>
      </div>
    );
  }

  const youTubeUrl = getYouTubeEmbedUrl(videoUrl);
  const vimeoUrl = getVimeoEmbedUrl(videoUrl);
  const embedUrl = youTubeUrl || vimeoUrl;

  if (embedUrl) {
    return (
      <div className="aspect-video overflow-hidden rounded border border-border">
        <iframe
          src={embedUrl}
          title="Lesson video"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Fall back to a direct video file (e.g. an .mp4 hosted anywhere).
  return (
    <video controls className="aspect-video w-full rounded border border-border bg-black">
      <source src={videoUrl} />
      Your browser doesn&rsquo;t support embedded video.
    </video>
  );
}
