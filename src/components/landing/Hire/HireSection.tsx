import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { HIRE_SECTION } from "./constants";
import { HireFeatureGrid } from "./HireFeatureGrid";

export function HireSection() {
  return (
    <section
      aria-label="Hire faster, verify less"
      className="w-full min-w-0 overflow-x-hidden bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto w-full min-w-0 max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <AnimateIn className="max-w-3xl">
          <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-[2.5rem]">
            {HIRE_SECTION.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base font-normal leading-relaxed text-[#231F20] sm:mt-5 sm:text-lg">
            {HIRE_SECTION.description}
          </p>
        </AnimateIn>

        <HireFeatureGrid />
      </div>
    </section>
  );
}
