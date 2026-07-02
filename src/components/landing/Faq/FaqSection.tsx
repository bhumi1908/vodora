import { poppins } from "../Work/fonts";
import { FaqAccordion } from "./FaqAccordion";
import { FAQ_ITEMS, FAQ_SECTION } from "./constants";

export function FaqSection() {
  return (
    <section
      aria-label="Frequently asked questions"
      className={`w-full min-w-0 overflow-x-hidden py-12 sm:py-16 lg:py-20 bg-[#F5F5F5] ${poppins.className}`}
    >
      <div className="mx-auto w-full min-w-0 max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold leading-tight text-black sm:text-[50px] sm:leading-[60px] lg:text-[50px] lg:leading-[60px]">
            {FAQ_SECTION.title}
          </h2>
          <div className="w-full min-w-0">
          <p className="mt-4  text-base font-normal  leading-[25px] sm:mt-5 sm:text-lg sm:leading-[1.6]">
            {FAQ_SECTION.description}
          </p>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 lg:mt-14">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
