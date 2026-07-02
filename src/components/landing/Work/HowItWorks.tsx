import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { HOW_IT_WORKS } from "./constants";
import { StepSeparators } from "./StepSeparators";
import { WorkImageColumn } from "./WorkImageColumn";
import { poppins } from "./fonts";

export function HowItWorks() {
  return (
    <section
      aria-label="How Vodora works"
      className={`w-full min-w-0 overflow-x-hidden py-12 sm:py-16 lg:py-20 bg-white ${poppins.className}`}
    >
      <div className="mx-auto w-full min-w-0 max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900 sm:mb-12 sm:text-4xl lg:mb-16 lg:text-[2.5rem]">
            {HOW_IT_WORKS.title}
          </h2>
        </AnimateIn>

        <div className="mx-auto flex w-full max-w-5xl justify-center border-t border-[#CCCCCC] xl:max-w-6xl">
          <div className="flex w-full flex-col lg:flex-row lg:items-stretch">
            <AnimateIn variant="fade-left">
              <WorkImageColumn />
            </AnimateIn>

            <div
              className="h-px w-full shrink-0 bg-[#CCCCCC] lg:h-auto lg:w-px"
              aria-hidden="true"
            />

            <AnimateIn delay={150} variant="fade-right" className="flex min-w-0 flex-1">
              <StepSeparators />
            </AnimateIn>
          </div>
        </div>
      </div>
    </section>
  );
}
