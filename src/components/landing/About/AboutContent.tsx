"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { ClipButton } from "@/components/ui/Button";
import { StatsGrid } from "./StatsGrid";
import type { AboutContentConfig, StatItem } from "./constants";

interface AboutContentProps extends AboutContentConfig {
  readonly stats: readonly StatItem[];
}

export function AboutContent({
  label,
  heading,
  paragraphs,
  buttonText,
  buttonHref,
  stats,
}: AboutContentProps) {
  const router = useRouter();

  function handleCta() {
    router.push(buttonHref);
  }

  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      <span className="text-sm sm:text-base font-semibold uppercase tracking-widest text-[#1D8B8A]">
        {label}
      </span>

      <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-[2.5rem] mb-1 sm:mb-2">
        {heading}
      </h2>

      <div className="flex flex-col gap-4 mb-4 sm:mb-10">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 30)} className="text-base sm:text-lg leading-relaxed text-black">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex items-end mb-4 sm:mb-10">
        <ClipButton
          text={buttonText}
          variant="primary"
          clipPosition="left"
          size="md"
          onClick={handleCta}
        />
        <ClipButton
          icon={<ArrowRight className="h-4 w-4" />}
          variant="primary"
          clipPosition="right"
          className="-ml-2"
          size="md"
          aria-label="Go to create profile"
          onClick={handleCta}
        />
      </div>

      <StatsGrid stats={stats} />
    </div>
  );
}
