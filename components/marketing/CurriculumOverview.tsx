import Link from "next/link";

const TRACKS = [
  {
    title: "General Track",
    description:
      "Two phases. Level 1 covers the fundamentals — blockchain, Bitcoin, Web3, smart contracts, NFTs, DeFi, AI, and the crypto economy. Level 2 moves into practical Web3 usage: essential tools, ecosystem participation, security, communication, and real-world application.",
    href: "/docs/track-general",
  },
  {
    title: "Ecosystem or Sponsorship Track",
    description:
      "How blockchain ecosystems and decentralized protocols work — network participation, smart contract integrations, grants, and ecosystem tooling supported by leading Web3 partners.",
    href: "/docs/track-ecosystem",
  },
  {
    title: "Skill set Track",
    description:
      "Career-ready hands-on specializations: Web3 UI/UX Design, Community & Growth, and Smart Contract Development. Each includes project-based assignments and mentor review.",
    href: "/docs/track-skillset",
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
                <Link
                  href={track.href}
                  className="mt-2 inline-block text-xs font-semibold text-accent-hover hover:underline"
                >
                  Explore {track.title} syllabus →
                </Link>
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
