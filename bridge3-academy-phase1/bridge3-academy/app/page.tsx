import { HeroPlaceholder } from "@/components/ui/HeroPlaceholder";
import { Section } from "@/components/ui/Section";

export default function HomePage() {
  return (
    <>
      <HeroPlaceholder />

      <Section
        id="how-it-works"
        eyebrow="How It Works"
        note="4-step card layout (apply & verify, learn with structure, build proof of work, graduate with certification) — built in Phase 3."
      />

      <Section
        id="curriculum"
        eyebrow="Curriculum Overview"
        note="General Track, Ecosystem Support Track, and Skill Set Track details — built in Phase 3."
      />

      <Section
        id="tracks"
        eyebrow="Specialization Tracks"
        note="Growth, Creative, and Operations track cards — built in Phase 3."
      />

      <Section
        id="social-proof"
        eyebrow="Social Proof"
        note="Student quotes and university partner logos — built in Phase 3."
      />

      <Section
        id="faq"
        eyebrow="FAQs"
        note="Accordion answering the most common questions — built in Phase 3."
      />

      <Section
        id="about"
        eyebrow="About"
        note="Mission and core values — built in Phase 3."
      />
    </>
  );
}
