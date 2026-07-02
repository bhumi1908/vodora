import { AboutSection } from "@/components/landing/About/AboutSection";
import { HireSection } from "@/components/landing/Hire/HireSection";
import { ReferencesCtaSection } from "@/components/landing/ReferencesCta/ReferencesCtaSection";
import { FaqSection } from "@/components/landing/Faq/FaqSection";
import { LandingFooter } from "@/components/landing/Footer/LandingFooter";
import { WorkStyleSection } from "@/components/landing/WorkStyle/WorkStyleSection";
import { LandingHeader } from "@/components/landing/Header/Header";
import { Hero } from "@/components/landing/Hero/Hero";
import { TrustIssuesSection } from "@/components/landing/TrustIssues/TrustIssuesSection";
import { HowItWorks } from "@/components/landing/Work/HowItWorks";
import { ReputationSection } from "@/components/landing/Reputation/ReputationSection";
import { VerificationSection } from "@/components/landing/Verification/VerificationSection";
import { LandingSmoothScroll } from "@/components/landing/shared/LandingSmoothScroll";
import { poppins } from "@/components/landing/Work/fonts";

export function NewLandingPage() {
  return (
    <LandingSmoothScroll>
      <div className={`${poppins.className} min-w-0 overflow-x-hidden antialiased`}>
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
          <FaqSection />
        </main>
        <LandingFooter />
      </div>
    </LandingSmoothScroll>
  );
}
