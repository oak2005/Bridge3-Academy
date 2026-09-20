"use client";

import { useState } from "react";

interface Props {
  certificateNumber: string;
  studentName: string;
  trackTitle: string;
}

export function CertificateActions({
  certificateNumber,
  studentName,
  trackTitle,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const tweetText = encodeURIComponent(
    `🎓 I just earned my official Certificate of Completion in ${trackTitle} from @Bridge3Academy! Verify my credential here: ${
      typeof window !== "undefined" ? window.location.href : ""
    }`
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return (
    <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-paper-raised p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-sm font-medium text-ink">
          Verified Credential · {certificateNumber}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={handlePrint}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-paper-hover"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print / Save PDF
        </button>

        <button
          onClick={handleCopyLink}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-paper-hover"
        >
          {copied ? (
            <>
              <span className="text-emerald-600">✓</span> Link Copied
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Copy Verification Link
            </>
          )}
        </button>

        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f1419] px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </a>
      </div>
    </div>
  );
}
