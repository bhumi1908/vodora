"use client";

import { useHorizontalCarousel } from "@/hooks/useHorizontalCarousel";
import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { poppins } from "../Work/fonts";
import { VERIFICATION_CARDS, VERIFICATION_SECTION } from "./constants";
import { VerificationCard } from "./VerificationCard";
import { VerificationNav } from "./VerificationNav";

const sliderExtendWidth = "w-[calc(100%+max(0px,(100vw-100%)/3))]";
const cardSlideWidth =
  "w-[calc(100%-max(0px,(100vw-100%)/2))]";

export function VerificationSection() {
  const {
    offset,
    goNext,
    goPrev,
    canGoPrev,
    canGoNext,
    trackRef,
    viewportRef,
    slideRef,
  } = useHorizontalCarousel({ itemCount: VERIFICATION_CARDS.length });

  return (
    <section
      aria-label="Multi-layer verification"
      className={`w-full min-w-0 overflow-x-hidden py-12 sm:py-16 lg:py-20 bg-[#FAFAFA] ${poppins.className}`}
    >
      <div className="mx-auto w-full min-w-0 max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-start sm:justify-between lg:mb-14">
          <AnimateIn className="max-w-3xl">
            <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-[2.5rem]">
              {VERIFICATION_SECTION.title}
            </h2>
            <p className="mt-3 text-base font-normal leading-relaxed sm:mt-4 sm:text-lg">
              {VERIFICATION_SECTION.subtitle}
            </p>
          </AnimateIn>

          <AnimateIn delay={120} variant="fade-right">
            <VerificationNav
              onPrev={goPrev}
              onNext={goNext}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
            />
          </AnimateIn>
        </div>

        <AnimateIn delay={200} variant="fade-up">
          <div ref={viewportRef} className={`select-none overflow-hidden ${sliderExtendWidth}`}>
          <div
            ref={trackRef}
            className="flex select-none items-stretch gap-4 transition-transform duration-500 ease-in-out motion-reduce:transition-none sm:gap-6 lg:gap-8"
            style={{ transform: `translateX(-${offset}px)` }}
          >
            {VERIFICATION_CARDS.map((card, index) => (
              <div
                key={card.id}
                ref={index === 0 ? slideRef : undefined}
                className={`${cardSlideWidth} shrink-0`}
              >
                <VerificationCard card={card} />
              </div>
            ))}
          </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
