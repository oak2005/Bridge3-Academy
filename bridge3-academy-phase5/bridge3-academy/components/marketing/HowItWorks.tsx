const STEPS = [
  {
    title: "Apply and get verified",
    description: "Join the waitlist, complete verification tasks, and secure a seat.",
  },
  {
    title: "Learn with structure",
    description: "Follow guided modules from foundation to advanced.",
  },
  {
    title: "Build proof of work",
    description: "Complete practical workshops and simulations.",
  },
  {
    title: "Graduate with certification",
    description: "Receive verified digital credentials and portfolio visibility.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border py-20">
      <div className="mx-auto max-w-content px-6">
        <h2 className="font-display text-3xl text-ink">A clear path from curiosity to career</h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded border border-border bg-paper-raised p-6">
              <span className="font-display text-3xl text-accent">{i + 1}</span>
              <h3 className="mt-3 font-sans text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
