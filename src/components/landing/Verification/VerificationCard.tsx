"use client";

import { ArrowRight, CheckIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { ClipButton } from "@/components/ui/Button";
import type { VerificationCardConfig } from "./constants";

interface VerificationCardProps {
  readonly card: VerificationCardConfig;
}

export function VerificationCard({ card }: VerificationCardProps) {
  const router = useRouter();

  function handleCta() {
    router.push(card.buttonHref);
  }

  return (
    <article className="flex h-full flex-col rounded-xl bg-white p-5  sm:p-6 lg:p-4">
      <div className="flex h-full flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="relative aspect-[620/405] w-full max-w-[620px] shrink-0 overflow-hidden rounded-xl lg:h-[405px] lg:w-[620px] lg:aspect-auto">
          <Image
            src={encodeURI(card.imageSrc)}
            alt={card.imageAlt}
            width={card.imageWidth}
            height={card.imageHeight}
            className="h-full w-full rounded-xl object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2 sm:gap-4">
          <h3 className="text-xl font-bold leading-snug text-black sm:text-2xl lg:text-[1.75rem]">
            {card.heading}
          </h3>

          <p className="text-base font-normal leading-relaxed text-black sm:text-lg max-w-[550px]">
            {card.description}
          </p>

          <ul className="flex flex-col gap-3 mt-2">
            {card.checks.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <CheckIcon
                  className="h-4 w-4 shrink-0 rounded-full border-2 border-[#7AC943] bg-[#7AC943] text-white"
                  aria-hidden="true"
                />
                <span className="text-base font-normal text-[#6B7280] sm:text-lg">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex items-end !font-normal">
            <ClipButton
              text={card.buttonText}
              variant="primary"
              clipPosition="left"
              size="md"
              onClick={handleCta}
            />
            <ClipButton
              icon={<ArrowRight className="h-4 w-4" />}
              variant="primary"
              clipPosition="right"
              className="-ml-2 font-normal text-base"
              size="md"
              aria-label="Go to create profile"
              onClick={handleCta}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
