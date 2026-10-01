import Link from "next/link";

const TRACKS = [
  {
    title: "General Track",
    description:
      "A complete foundation in blockchain mechanics, Bitcoin, decentralized consensus, smart contracts, digital custody, security best practices, and the everyday tools needed to navigate the Web3 space with confidence.",
    href: "/docs/track-general",
  },
  {
    title: "Ecosystem or Sponsorship Track",
    description:
      "Hands-on immersion with leading blockchain networks, developer grants, and protocol integrations. For sponsors, it means reaching students at the exact moment they're learning the habits and tools they'll use for years.",
    href: "/docs/track-ecosystem",
  },
  {
    title: "Skill set Track",
    description:
      "Practical specializations focused on high-demand modern disciplines: Content creation/writing, Community Management, Designer (UI/UX, Web, Graphics and more), Social Media Manager, Prompt Engineering, Technical/Growth Writing, Developer (Depend on partnership) and much more. Every track produces tangible proof of work and portfolio deliverables.",
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
