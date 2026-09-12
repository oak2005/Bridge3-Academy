import { WaitlistHero } from "@/components/waitlist/WaitlistHero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { CurriculumOverview } from "@/components/marketing/CurriculumOverview";
import { SpecializationTracks } from "@/components/marketing/SpecializationTracks";
import { SocialProof } from "@/components/marketing/SocialProof";
import { FAQ } from "@/components/marketing/FAQ";
import { About } from "@/components/marketing/About";

export default function HomePage() {
  return (
    <>
      <WaitlistHero />
      <HowItWorks />
      <CurriculumOverview />
      <SpecializationTracks />
      <SocialProof />
      <FAQ />
      <About />
    </>
  );
}
