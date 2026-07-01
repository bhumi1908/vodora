import { AboutSection } from "@/components/landing/About/AboutSection";
import { HireSection } from "@/components/landing/Hire/HireSection";
import { ReferencesCtaSection } from "@/components/landing/ReferencesCta/ReferencesCtaSection";
import { WorkStyleSection } from "@/components/landing/WorkStyle/WorkStyleSection";
import { LandingHeader } from "@/components/landing/Header/Header";
import { Hero } from "@/components/landing/Hero/Hero";
import { TrustIssuesSection } from "@/components/landing/TrustIssues/TrustIssuesSection";
import { HowItWorks } from "@/components/landing/Work/HowItWorks";
import { ReputationSection } from "@/components/landing/Reputation/ReputationSection";
import { VerificationSection } from "@/components/landing/Verification/VerificationSection";

export default function LandingPage2() {
  return (
    <>
      <main>
        <LandingHeader />
        <Hero />
        <AboutSection />
        <TrustIssuesSection />
        <HowItWorks />
        <VerificationSection />
        <ReputationSection />
        <HireSection />
        <ReferencesCtaSection />
        <WorkStyleSection />
      </main>
    </>
  );
}
