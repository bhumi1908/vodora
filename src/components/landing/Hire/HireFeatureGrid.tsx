import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { HIRE_FEATURE_CARDS } from "./constants";
import { HireFeatureCard } from "./HireFeatureCard";

export function HireFeatureGrid() {
  return (
    <div className="mt-10 grid w-full grid-cols-1 items-stretch gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:mt-14 lg:grid-cols-3 lg:gap-6">
      {HIRE_FEATURE_CARDS.map((card, index) => (
        <AnimateIn key={card.id} delay={index * 100} variant="scale-in" className="h-full">
          <HireFeatureCard {...card} />
        </AnimateIn>
      ))}
    </div>
  );
}
