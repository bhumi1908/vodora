import { HIRE_FEATURE_CARDS } from "./constants";
import { HireFeatureCard } from "./HireFeatureCard";

export function HireFeatureGrid() {
  return (
    <div className="mt-10 grid w-full grid-cols-1 items-stretch gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-8 md:gap-10 lg:mt-14 lg:grid-cols-3 lg:gap-6 xl:mx-auto xl:w-fit xl:gap-5">
      {HIRE_FEATURE_CARDS.map((card) => (
        <HireFeatureCard key={card.id} {...card} />
      ))}
    </div>
  );
}
