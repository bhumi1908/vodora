"use client";

import type { FaqItemConfig } from "./constants";

interface FaqItemProps {
  readonly item: FaqItemConfig;
  readonly index: number;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

function formatIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function FaqItem({ item, index, isOpen, onToggle }: FaqItemProps) {
  const numberLabel = `${formatIndex(index)}.`;

  return (
    <div className="min-w-0 border-b border-[#000]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex w-full min-w-0 items-start gap-3 py-5 text-left sm:gap-6 sm:py-6 md:items-center md:py-8 lg:gap-8 ${
          isOpen ? "border-b border-black" : ""
        }`}
      >
        <span
          className={`w-7 shrink-0 pt-0.5 text-sm font-normal tabular-nums leading-none text-[#BDCCD4] sm:w-8 sm:pt-0 sm:text-[50px] lg:w-10 lg:text-[50px] `}
        >
          {numberLabel}
        </span>

        <span
          className={`min-w-0 flex-1 break-words pl-1 text-lg font-normal leading-snug sm:pl-4 sm:text-xl sm:leading-snug md:text-2xl lg:text-3xl lg:leading-[44px] xl:text-[49px] xl:leading-[58px] ${
            isOpen ? "text-[#1D8B8A]" : "text-black"
          }`}
        >
          {item.question}
        </span>

        <span
          aria-hidden="true"
          className={`shrink-0 pt-0.5 text-2xl font-light leading-none sm:pt-0 sm:text-3xl lg:text-[33px] ${
            isOpen ? "text-[#1D8B8A]" : "text-black"
          }`}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen ? (
        <div className="min-w-0 pb-5 pt-6 sm:pb-8 sm:pt-8 lg:pt-10">
          <p className="text-lg font-normal leading-snug text-black sm:text-xl sm:leading-snug md:text-2xl lg:text-3xl lg:leading-[44px] xl:text-[41px] xl:leading-[49px]">
            {item.subtitle}
          </p>
          <p className="mt-4 max-w-full border-l-2 border-black pl-3 text-sm font-normal leading-relaxed text-[#231F20] sm:mt-6 sm:pl-4 sm:text-base sm:leading-[1.7] md:mt-8 md:pl-5 lg:max-w-[80%]">
            {item.answer}
          </p>
        </div>
      ) : null}
    </div>
  );
}
