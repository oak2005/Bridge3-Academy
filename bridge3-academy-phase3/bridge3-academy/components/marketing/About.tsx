const VALUES = ["Accessibility", "Structure", "Proof of Work", "Community"];

export function About() {
  return (
    <section id="about" className="py-20">
      <div className="mx-auto max-w-content px-6">
        <h2 className="font-display text-3xl text-ink">About</h2>
        <p className="mt-4 max-w-prose text-ink-soft">
          Bridge3 Academy reduces barriers to Web3 education in Africa through
          structured, practical, career-focused training.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {VALUES.map((value) => (
            <span
              key={value}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-ink-soft"
            >
              {value}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
