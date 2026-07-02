"use client";

import { useHorizontalCarousel } from "@/hooks/useHorizontalCarousel";
import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { poppins } from "../Work/fonts";
import { WORK_STYLE_CARDS, WORK_STYLE_SECTION } from "./constants";
import { WorkStyleCard } from "./WorkStyleCard";
import { WorkStyleNav } from "./WorkStyleNav";

const sliderExtendWidth = "w-[calc(100%+max(0px,(100vw-100%)/2))]";

export function WorkStyleSection() {
  const {
    offset,
    goNext,
    goPrev,
    canGoPrev,
    canGoNext,
    trackRef,
    viewportRef,
    slideRef,
  } = useHorizontalCarousel({ itemCount: WORK_STYLE_CARDS.length });

  return (
    <section
      aria-label="One profile for every work style"

      className={`mx-auto max-w-screen-2xl overflow-x-hidden bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 ${poppins.className}`}
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-8 xl:gap-12">
          <AnimateIn variant="fade-left" className="w-full shrink-0 lg:max-w-[38%] xl:max-w-[420px]">
            <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-[2.5rem]">
              {WORK_STYLE_SECTION.titleLine1}
              <br />
              {WORK_STYLE_SECTION.titleLine2}
            </h2>
            <p className="mt-5 max-w-xl text-base font-normal leading-[1.6] text-black sm:mt-6 sm:text-lg">
              {WORK_STYLE_SECTION.description}
            </p>
            <div className="mt-6 sm:mt-8">
              <WorkStyleNav
                onPrev={goPrev}
                onNext={goNext}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
              />
            </div>
          </AnimateIn>

          <div
            ref={viewportRef}
            className={`min-w-0 flex-1 select-none overflow-hidden ${sliderExtendWidth}`}
          >
            <div
              ref={trackRef}
              className="flex select-none items-stretch gap-4 transition-transform duration-500 ease-in-out motion-reduce:transition-none sm:gap-5 lg:gap-6"
              style={{ transform: `translateX(-${offset}px)` }}
            >
              {WORK_STYLE_CARDS.map((card, index) => (
                <div
                  key={card.id}
                  ref={index === 0 ? slideRef : undefined}
                  className="w-[260px] shrink-0 sm:w-[280px] lg:w-[300px] xl:w-[320px]"
                >
                  <WorkStyleCard card={card} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
