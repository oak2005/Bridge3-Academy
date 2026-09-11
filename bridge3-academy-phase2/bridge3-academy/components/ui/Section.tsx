interface SectionProps {
  id: string;
  eyebrow: string;
  note: string;
}

/**
 * Placeholder shell for a homepage section. Phase 1 only reserves the
 * structure and scroll anchor for each section — real copy and layout
 * arrive in Phase 3 (per the build plan).
 */
export function Section({ id, eyebrow, note }: SectionProps) {
  return (
    <section id={id} className="border-b border-border py-20">
      <div className="mx-auto max-w-content px-6">
        <h2 className="font-display text-2xl text-ink">{eyebrow}</h2>
        <p className="mt-2 max-w-prose text-sm text-ink-muted">{note}</p>
      </div>
    </section>
  );
}
