"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { ClipButton } from "@/components/ui/Button";
import { REPUTATION_OWNERSHIP, REPUTATION_SECTION } from "./constants";

export function ReputationContent() {
  const router = useRouter();

  function handleCta() {
    router.push(REPUTATION_SECTION.cta.href);
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 sm:gap-6 lg:gap-7">
      <h2 className="text-3xl font-normal leading-tight text-white sm:text-4xl sm:leading-snug md:text-5xl lg:text-[56px] lg:leading-[67px]">
        {REPUTATION_SECTION.titleLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>

      <p className="max-w-none text-base leading-relaxed text-white sm:text-lg  lg:max-w-xl lg:text-[21px] xl:max-w-none">
        {REPUTATION_SECTION.descriptionLines.map((line) => (
          <span key={line} className="block xl:whitespace-nowrap pr-10">
            {line}
          </span>
        ))}
      </p>

      <div className="mt-2 flex items-end sm:mt-6 lg:mt-10">
        <ClipButton
          text={REPUTATION_SECTION.cta.text}
          variant="outline"
          clipPosition="left"
          size="md"
          className="[&_span:first-child]:!border-white [&_span:first-child]:!text-[#1D8B8A]"
          onClick={handleCta}
        />
        <ClipButton
          icon={<ArrowRight className="h-4 w-4" />}
          variant="outline"
          clipPosition="right"
          className="-ml-2 [&_span_span]:!text-white"
          size="md"
          aria-label="Go to create profile"
          onClick={handleCta}
        />
      </div>
    </div>
  );
}

export function ReputationOwnershipContent() {
  const router = useRouter();

  function handleCta() {
    router.push(REPUTATION_OWNERSHIP.cta.href);
  }

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-col gap-6 sm:gap-8">
        {REPUTATION_OWNERSHIP.headlineGroups.map((group) => (
          <h2
            key={group[0]}
            className="text-2xl font-normal leading-snug text-[#808080] sm:text-3xl sm:leading-snug lg:text-[48px] lg:leading-[68px]"
          >
            {group.map((line) => (
              <span key={line} className="block xl:whitespace-nowrap">
                {line}
              </span>
            ))}
          </h2>
        ))}
      </div>

      <p className="mt-8 text-base font-normal leading-relaxed text-black sm:mt-10 sm:text-lg lg:mt-12">
        {REPUTATION_OWNERSHIP.paragraphLines.map((line) => (
          <span key={line} className="block xl:whitespace-nowrap">
            {line}
          </span>
        ))}
      </p>

      <div className="mt-8 flex   sm:mt-10 lg:mt-12">
        <ClipButton
          text={REPUTATION_OWNERSHIP.cta.text}
          variant="primary"
          clipPosition="left"
          size="md"
          className="[&_span:first-child]:!px-6 [&_span:first-child]:!font-normal [&_span:first-child]:!tracking-normal sm:[&_span:first-child]:!px-8"
          onClick={handleCta}
        />
        <ClipButton
          icon={<ArrowRight className="h-4 w-4" />}
          variant="primary"
          clipPosition="right"
          className="-ml-2 [&_span:first-child]:!font-normal [&_span:first-child]:!tracking-normal"
          size="md"
          aria-label="Go to contact us"
          onClick={handleCta}
        />
      </div>
    </div>
  );
}
