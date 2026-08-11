import { AnalyticsProofSection } from "@/components/home/AnalyticsProofSection";
import { FeatureGridSection } from "@/components/home/FeatureGridSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { HomeHero } from "@/components/home/HomeHero";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PlatformGrid } from "@/components/home/PlatformGrid";
import { PricingPreviewSection } from "@/components/home/PricingPreviewSection";
import { RoutingDiagram } from "@/components/home/RoutingDiagram";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <PlatformGrid />
      <HowItWorksSection />
      <RoutingDiagram />
      <FeatureGridSection />
      <AnalyticsProofSection />
      <PricingPreviewSection />
      <FinalCtaSection />
    </>
  );
}
