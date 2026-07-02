"use client";

import { useState } from "react";

import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import type { FaqItemConfig } from "./constants";
import { FaqItem } from "./FaqItem";

interface FaqAccordionProps {
  readonly items: readonly FaqItemConfig[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="gap-4 flex flex-col border-[#E4E4E7]">
      {items.map((item, index) => (
        <AnimateIn key={item.id} delay={index * 60} variant="fade-up">
          <FaqItem
            item={item}
            index={index}
            isOpen={openIndex === index}
            onToggle={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
          />
        </AnimateIn>
      ))}
    </div>
  );
}
