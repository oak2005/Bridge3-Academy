const QUOTES = [
  {
    quote: "Bridge3 helped me understand DeFi beyond YouTube tutorials.",
    attribution: "Early beta student",
  },
];

export function SocialProof() {
  return (
    <section id="social-proof" className="border-b border-border py-20">
      <div className="mx-auto max-w-content px-6">
        <div className="mx-auto max-w-prose text-center">
          {QUOTES.map((item) => (
            <blockquote key={item.quote}>
              <p className="font-display text-2xl leading-snug text-ink">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-4 text-sm text-ink-muted">— {item.attribution}</footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-14">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-ink-muted">
            University partners
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex h-16 items-center justify-center rounded border border-dashed border-border text-xs text-ink-muted"
              >
                Partner slot
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
