import { poppins } from "../Work/fonts";
import { VERIFICATION_CARDS, VERIFICATION_SECTION } from "./constants";
import { VerificationCard } from "./VerificationCard";
import { VerificationCardPeek } from "./VerificationCardPeek";
import { VerificationNav } from "./VerificationNav";

const cardSlideWidth =
  "w-[calc(100%-max(0px,(100vw-100%)/2))]";

export function VerificationSection() {
  const primaryCard = VERIFICATION_CARDS[0];
  const peekCard = VERIFICATION_CARDS[1];

  return (
    <section
      aria-label="Multi-layer verification"
      className={`overflow-x-hidden bg-[#FAFAFA] py-12 sm:py-16 lg:py-16 ${poppins.className}`}
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-start sm:justify-between lg:mb-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-[2.5rem]">
              {VERIFICATION_SECTION.title}
            </h2>
            <p className="mt-3 text-base font-normal leading-relaxed sm:mt-4 sm:text-lg">
              {VERIFICATION_SECTION.subtitle}
            </p>
          </div>

          <VerificationNav />
        </div>

        <div className=" w-[calc(100%+max(0px,(100vw-100%)/3))]">
          <div className="flex items-stretch gap-4 sm:gap-6 lg:gap-8">
            <div className={`${cardSlideWidth} shrink-0`}>
              <VerificationCard card={primaryCard} />
            </div>

            <div className={`${cardSlideWidth} shrink-0`}>
              <VerificationCardPeek card={peekCard} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
