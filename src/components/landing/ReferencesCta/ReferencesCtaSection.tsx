import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { ReferencesCtaContent } from "./ReferencesCtaContent";

export function ReferencesCtaSection() {
  return (
    <section
      aria-label="References verified once, used forever"
      className="relative overflow-hidden w-full min-w-0 py-12 sm:py-16 lg:py-20 bg-references-textured"
    >
      <div className="relative z-10 mx-auto w-full min-w-0 max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <AnimateIn variant="fade-up">
          <ReferencesCtaContent />
        </AnimateIn>
      </div>
    </section>
  );
}
