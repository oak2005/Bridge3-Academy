"use client";

import { useState } from "react";

interface Props {
  articleTitle: string;
}

export function DocsFeedback({ articleTitle }: Props) {
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);

  return (
    <div className="mt-12 rounded-xl border border-border bg-paper-raised p-6 text-center">
      {feedback ? (
        <div className="flex flex-col items-center justify-center">
          <span className="text-xl">🙌</span>
          <p className="mt-2 text-xs font-semibold text-ink">
            Thank you for your feedback!
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">
            Your input helps us continuously improve the Bridge3 Academy curriculum for African builders.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold text-ink">Was this guide helpful?</p>
          <p className="mt-1 text-[11px] text-ink-muted">
            Let our curriculum team know if &ldquo;{articleTitle}&rdquo; answered your questions.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setFeedback("helpful")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-paper px-4 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:bg-paper-hover"
            >
              <span>👍</span> Yes, helpful
            </button>
            <button
              type="button"
              onClick={() => setFeedback("not-helpful")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-paper px-4 py-1.5 text-xs font-medium text-ink transition-colors hover:border-border hover:bg-paper-hover"
            >
              <span>👎</span> Needs improvement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
