import type { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
  narrow?: boolean;
}

export function SectionContainer({
  children,
  className = "",
  id,
  narrow = false,
}: SectionContainerProps) {
  return (
    <section id={id} className={className}>
      <div
        className={`mx-auto px-4 sm:px-6 lg:px-8 ${
          narrow ? "max-w-[1200px]" : "max-w-[1440px]"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
