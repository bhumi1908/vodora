"use client";

import type { ReactNode } from "react";

import { AnimateIn } from "@/components/landing/shared/AnimateIn";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
  narrow?: boolean;
  animate?: boolean;
}

export function SectionContainer({
  children,
  className = "",
  id,
  narrow = false,
  animate = true,
}: SectionContainerProps) {
  const containerClass = `mx-auto px-4 sm:px-6 lg:px-8 ${
    narrow ? "max-w-[1200px]" : "max-w-[1440px]"
  }`;

  return (
    <section id={id} className={className}>
      {animate ? (
        <AnimateIn className={containerClass}>{children}</AnimateIn>
      ) : (
        <div className={containerClass}>{children}</div>
      )}
    </section>
  );
}
