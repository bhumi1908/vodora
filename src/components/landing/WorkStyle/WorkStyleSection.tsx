import { poppins } from "../Work/fonts";
import { WORK_STYLE_CARDS, WORK_STYLE_SECTION } from "./constants";
import { WorkStyleCard } from "./WorkStyleCard";
import { WorkStyleNav } from "./WorkStyleNav";

const sliderExtendWidth = "w-[calc(100%+max(0px,(100vw-100%)/2))]";

export function WorkStyleSection() {
  return (
    <section
      aria-label="One profile for every work style"
      className={`w-full min-w-0 overflow-x-hidden py-12 sm:py-16 lg:py-20 bg-white ${poppins.className}`}
    >
      <div className="mx-auto w-full min-w-0 max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 sm:gap-12 lg:flex-row lg:items-start lg:gap-8 xl:gap-12">
          <div className="w-full shrink-0 lg:max-w-[48%] xl:max-w-[560px]">
          <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-[2.5rem]">
            {WORK_STYLE_SECTION.titleLine1}
            <br />
            {WORK_STYLE_SECTION.titleLine2}
          </h2>
          <p className="mt-5 max-w-2xl text-base font-normal leading-[1.6] text-black sm:mt-6 sm:text-lg lg:max-w-none">
            {WORK_STYLE_SECTION.description}
          </p>
          <div className="mt-6 sm:mt-8">
            <WorkStyleNav />
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-x-hidden ">
          <div className={sliderExtendWidth}>
            <div className="flex items-stretch gap-4 sm:gap-5 lg:gap-6">
              {WORK_STYLE_CARDS.map((card) => (
                <div
                  key={card.id}
                  className="w-[260px] shrink-0 sm:w-[280px] lg:w-[300px] xl:w-[320px]"
                >
                  <WorkStyleCard card={card} />
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
