"use client";

import { useState } from "react";

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
        <FaqItem
          key={item.id}
          item={item}
          index={index}
          isOpen={openIndex === index}
          onToggle={() =>
            setOpenIndex(openIndex === index ? null : index)
          }
        />
      ))}
    </div>
  );
}
