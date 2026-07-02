"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { ClipButton } from "@/components/ui/Button";
import { REFERENCES_CTA_SECTION } from "./constants";

export function ReferencesCtaContent() {
  const router = useRouter();

  function handleCta() {
    router.push(REFERENCES_CTA_SECTION.cta.href);
  }

  return (
    <div className="flex min-w-0 flex-col items-center gap-5 text-center sm:gap-6 lg:gap-7">
      <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl sm:leading-snug md:text-5xl lg:text-[48px] lg:leading-[58px]">
        {REFERENCES_CTA_SECTION.title}
      </h2>

      <p className="max-w-3xl text-base leading-[29px] text-white sm:text-lg lg:text-[21px]">
        {REFERENCES_CTA_SECTION.descriptionLines.map((line) => (
          <span key={line} className="block xl:whitespace-nowrap">
            {line}
          </span>
        ))}
      </p>

      <div className="mt-2 flex items-end justify-center sm:mt-6 lg:mt-8">
        <ClipButton
          text={REFERENCES_CTA_SECTION.cta.text}
          variant="outline"
          clipPosition="left"
          size="md"
          className="[&_span:first-child]:!border-white [&_span:first-child]:!text-[#236B69]"
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
