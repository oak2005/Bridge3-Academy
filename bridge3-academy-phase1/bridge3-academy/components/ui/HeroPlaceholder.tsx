export function HeroPlaceholder() {
  return (
    <section id="waitlist" className="border-b border-border py-20">
      <div className="mx-auto grid max-w-content items-center gap-12 px-6 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-ink-muted">Hero — structure reserved</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">
            Headline, subtext, and email capture arrive in Phase 3
          </h1>
          <p className="mt-4 max-w-prose text-ink-soft">
            This slot holds the left column: headline, supporting copy, an email
            input, the primary CTA, and trust badges once the waitlist funnel is
            built.
          </p>
        </div>
        <div className="flex aspect-[4/3] items-center justify-center rounded border border-dashed border-border bg-paper-raised">
          <p className="text-sm text-ink-muted">Illustration slot</p>
        </div>
      </div>
    </section>
  );
}
