import { poppins } from "../Work/fonts";
import { HIRE_SECTION } from "./constants";
import { HireFeatureGrid } from "./HireFeatureGrid";

export function HireSection() {
  return (
    <section
      aria-label="Hire faster, verify less"
      className={`bg-white flex flex-col items-center justify-center py-12 sm:py-16 lg:py-12 ${poppins.className}`}
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl  font-bold leading-[49px] text-black sm:text-4xl lg:text-[2.5rem]">
            {HIRE_SECTION.title}
          </h2>
          <p className="mt-2 max-w-2xl text-[#231F20] text-base font-normal leading-[29px] sm:mt-2 sm:text-lg">
            {HIRE_SECTION.description}
          </p>
        </div>

        <HireFeatureGrid />
      </div>
    </section>
  );
}
