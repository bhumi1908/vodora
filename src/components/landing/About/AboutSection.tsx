import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { poppins } from "../Work/fonts";
import { AboutContent } from "./AboutContent";import { AboutImageCard } from "./AboutImageCard";
import { ABOUT_CONTENT, ABOUT_IMAGE_CARD, ABOUT_STATS } from "./constants";

export function AboutSection() {
  return (
    <section
      aria-label="About Vodora"
      className={`bg-[#FAFAFA] py-16 sm:py-20 lg:py-24 ${poppins.className}`}
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-0">
          <AnimateIn
            variant="fade-left"
            className="w-full lg:w-fit lg:pr-12 xl:pr-16 order-2 sm:order-0"
          >
            <AboutImageCard
              image={ABOUT_IMAGE_CARD.image}
              title={ABOUT_IMAGE_CARD.title}
              description={ABOUT_IMAGE_CARD.description}
            />
          </AnimateIn>

          <div className="hidden w-px shrink-0 bg-gray-200 lg:block" aria-hidden="true" />

          <AnimateIn
            delay={120}
            variant="fade-right"
            className="w-full lg:w-1/2 lg:pl-12 xl:pl-16"
          >
            <AboutContent
              label={ABOUT_CONTENT.label}
              heading={ABOUT_CONTENT.heading}
              paragraphs={ABOUT_CONTENT.paragraphs}
              buttonText={ABOUT_CONTENT.buttonText}
              buttonHref={ABOUT_CONTENT.buttonHref}
              stats={ABOUT_STATS}
            />
          </AnimateIn>
        </div>      </div>
    </section>
  );
}
