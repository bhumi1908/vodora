import { HIRE_FEATURE_CARDS } from "./constants";
import { HireFeatureCard } from "./HireFeatureCard";

export function HireFeatureGrid() {
  return (
    <div className="my-10 mx-auto grid grid-cols-1 gap-3 bg-white sm:mt-12 sm:grid-cols-2 lg:mt-14 lg:w-fit lg:grid-cols-3 lg:gap-5">
      {HIRE_FEATURE_CARDS.map((card) => (
        <HireFeatureCard key={card.id} {...card} />
      ))}
    </div>
  );
}
