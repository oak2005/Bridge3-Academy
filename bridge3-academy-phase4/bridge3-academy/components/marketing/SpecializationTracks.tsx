import Link from "next/link";

const TRACKS = [
  {
    title: "Growth",
    description:
      "Community building, ecosystem outreach, and the skills behind driving real adoption.",
  },
  {
    title: "Creative",
    description:
      "Content, design, and storytelling — turning complex Web3 ideas into things people actually understand.",
  },
  {
    title: "Operations",
    description:
      "The coordination and execution work that keeps a project or community actually running.",
  },
];

export function SpecializationTracks() {
  return (
    <section id="tracks" className="border-b border-border py-20">
      <div className="mx-auto max-w-content px-6">
        <h2 className="font-display text-3xl text-ink">Specialization Tracks</h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {TRACKS.map((track) => (
            <div key={track.title} className="rounded border border-border bg-paper-raised p-6">
              <h3 className="font-display text-xl text-ink">{track.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{track.description}</p>
              <Link
                href="/docs"
                className="mt-4 inline-block text-sm font-semibold text-accent-hover underline underline-offset-4"
              >
                Explore track
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
