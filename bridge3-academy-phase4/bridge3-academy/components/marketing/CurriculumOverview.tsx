import Link from "next/link";

const TRACKS = [
  {
    title: "General Track",
    description:
      "Two phases. Level 1 covers the fundamentals — blockchain, Bitcoin, Web3, smart contracts, NFTs, DeFi, AI, and the crypto economy. Level 2 moves into practical Web3 usage: essential tools, ecosystem participation, security, communication, and real-world application.",
  },
  {
    title: "Ecosystem Support Track",
    description:
      "How blockchain ecosystems actually work — how users interact with them, how decentralized applications operate, and the basics of ecosystem infrastructure and language.",
  },
  {
    title: "Skill Set Track",
    description:
      "Choose a specialization: Designer, Creator, or Community & Growth. Each includes hands-on training, assignments, and project-based learning.",
    footnote: "Builder Track — planned partnership, coming soon.",
  },
];

export function CurriculumOverview() {
  return (
    <section id="curriculum" className="border-b border-border py-20">
      <div className="mx-auto max-w-content px-6">
        <h2 className="font-display text-3xl text-ink">Curriculum Overview</h2>
        <p className="mt-3 max-w-prose text-ink-soft">
          A structured learning system designed to take students from Web3
          fundamentals to real ecosystem participation and skill development.
        </p>

        <div className="mt-10 flex flex-col divide-y divide-border border-y border-border">
          {TRACKS.map((track) => (
            <div key={track.title} className="grid gap-2 py-8 sm:grid-cols-[240px_1fr] sm:gap-8">
              <h3 className="font-sans text-base font-semibold text-ink">{track.title}</h3>
              <div>
                <p className="max-w-prose text-sm text-ink-muted">{track.description}</p>
                {track.footnote && (
                  <p className="mt-2 text-xs font-medium text-accent-hover">{track.footnote}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/docs"
          className="mt-8 inline-block text-sm font-semibold text-accent-hover underline underline-offset-4"
        >
          View full curriculum
        </Link>
      </div>
    </section>
  );
}
