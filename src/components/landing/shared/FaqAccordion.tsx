"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { AnimateIn } from "@/components/landing/shared/AnimateIn";

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  title?: string;
  className?: string;
  compact?: boolean;
}

export function FaqAccordion({
  items,
  title,
  className = "",
  compact = false,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={`bg-gray-50 py-14 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {title ? (
          <AnimateIn>
            <h2
              className={`mb-10 text-center font-semibold text-gray-900 sm:mb-12 ${
                compact
                  ? "text-3xl sm:text-4xl"
                  : "text-3xl sm:mb-16 sm:text-4xl lg:text-5xl"
              }`}
            >
              {title}
            </h2>
          </AnimateIn>
        ) : null}
        <div className="mx-auto max-w-3xl space-y-3 sm:space-y-4">
          {items.map((faq, i) => (
            <AnimateIn key={faq.q} delay={i * 80}>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white sm:rounded-xl">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-6"
                >
                  <span className="pr-4 font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === i && (
                  <div
                    className={`px-4 pb-4 text-gray-600 sm:px-6 ${
                      compact ? "text-sm leading-relaxed" : ""
                    }`}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
