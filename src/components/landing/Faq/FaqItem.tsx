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
  const panelId = `${item.id}-answer`;

  return (
    <div className="min-w-0 border-b border-[#000]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`flex w-full min-w-0 items-baseline gap-2 py-5 text-left transition-[border-color] duration-300 ease-out motion-reduce:transition-none sm:gap-4 sm:py-6 lg:items-center lg:gap-8 lg:py-8 ${
          isOpen ? "border-b border-black" : ""
        }`}
      >
        <span className="w-8 shrink-0 text-sm font-normal tabular-nums leading-none text-[#BDCCD4] sm:w-9 sm:text-base md:text-lg lg:w-14 lg:text-[50px]">
          {numberLabel}
        </span>

        <span
          className={`min-w-0 flex-1 break-words text-lg font-normal leading-snug transition-colors duration-300 ease-out motion-reduce:transition-none sm:text-xl sm:leading-snug md:text-2xl lg:text-3xl lg:leading-[44px] xl:text-[49px] xl:leading-[58px] ${
            isOpen ? "text-[#1D8B8A]" : "text-black"
          }`}
        >
          {item.question}
        </span>

        <span
          aria-hidden="true"
          className={`shrink-0 self-center text-2xl font-light leading-none transition-colors duration-300 ease-out motion-reduce:transition-none sm:text-3xl lg:text-[33px] ${
            isOpen ? "text-[#1D8B8A]" : "text-black"
          }`}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <div
        id={panelId}
        aria-hidden={!isOpen}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`min-h-0 min-w-0 pb-5 pt-6 transition-opacity duration-300 ease-out motion-reduce:transition-none sm:pb-8 sm:pt-8 lg:pt-10 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-lg font-normal leading-snug text-black sm:text-xl sm:leading-snug md:text-2xl lg:text-3xl lg:leading-[44px] xl:text-[41px] xl:leading-[49px]">
              {item.subtitle}
            </p>
            <p className="mt-4 max-w-full border-l-2 border-black pl-3 text-sm font-normal leading-relaxed text-[#231F20] sm:mt-6 sm:pl-4 sm:text-base sm:leading-[1.7] md:mt-8 md:pl-5 lg:max-w-[80%]">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
