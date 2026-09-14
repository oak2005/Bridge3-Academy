"use client";

import { useState } from "react";

export function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function share() {
    if (navigator.share) {
      navigator.share({ title: "Bridge3 Academy Portfolio", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="rounded bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
    >
      {copied ? "Link copied!" : "Share this profile"}
    </button>
  );
}
