import { AboutSection } from "@/components/landing/About/AboutSection";
import { LandingHeader } from "@/components/landing/Header/Header";
import { Hero } from "@/components/landing/Hero/Hero";
import { TrustIssuesSection } from "@/components/landing/TrustIssues/TrustIssuesSection";

export default function LandingPage2() {
  return (
    <>
      <main>
        <LandingHeader />
        <Hero />
        <AboutSection />
        <TrustIssuesSection />
      </main>
    </>
  );
}
