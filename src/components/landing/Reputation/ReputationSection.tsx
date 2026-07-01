import Image from "next/image";

import { poppins } from "../Work/fonts";
import { REPUTATION_BG, REPUTATION_OWNERSHIP, REPUTATION_SECTION } from "./constants";
import { ReputationContent, ReputationOwnershipContent } from "./ReputationContent";

export function ReputationSection() {
  return (
    <>
      <section
        aria-label="Your reputation, ready to travel"
        className={`relative  overflow-hidden bg-[#1D8B8A]  pt-12 pb-6 sm:pt-16 sm:pb-8 lg:pt-20 lg:pb-10 ${poppins.className}`}
      >
        <Image
          src={REPUTATION_BG}
          alt=""
          fill
          className="object-cover object-center opacity-40"
          sizes="100vw"
        />

        <div className="relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-stretch gap-10 sm:gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="w-full min-w-0 flex-1 lg:max-w-[58%] xl:max-w-[60%]">
              <ReputationContent />
            </div>

            <div className="relative mx-auto h-[260px] w-[260px] shrink-0 sm:h-[300px] sm:w-[300px] lg:mx-0 lg:h-[340px] lg:w-[340px] xl:h-[367px] xl:w-[382px] lg:mr-10 xl:mr-12">
              <Image
                src={REPUTATION_SECTION.image.src}
                alt={REPUTATION_SECTION.image.alt}
                fill
                className="object-contain object-center"
                sizes="(max-width: 640px) 260px, (max-width: 1024px) 300px, 382px"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Your references are yours to keep"
        className={`bg-[#F1F2F4] pt-6 pb-12 py-12 sm:py-16 lg:py-20 ${poppins.className}`}
      >
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-4 lg:px-6">
          <div className="flex flex-col items-stretch gap-10 sm:gap-12 lg:flex-row lg:items-center lg:gap-12 xl:gap-16">
            <div className="w-full min-w-0 lg:w-1/2">
              <div className="relative mx-auto aspect-[489/746]  max-w-[489px]  max-h-[730px] overflow-hidden rounded-xl lg:mx-0 lg:max-w-none">
                <Image
                  src={encodeURI(REPUTATION_OWNERSHIP.image.src)}
                  alt={REPUTATION_OWNERSHIP.image.alt}
                  width={REPUTATION_OWNERSHIP.image.width}
                  height={REPUTATION_OWNERSHIP.image.height}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="w-full min-w-0  lg:pr-8 xl:pl-12">
              <ReputationOwnershipContent />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
