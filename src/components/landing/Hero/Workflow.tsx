import { HERO_WORKFLOW_STEPS } from "./constants";
import { HeroWorkflowStep } from "./HeroWorkflowStep";

export function Workflow() {
  return (
    <div className="w-full flex justify-center" role="list" aria-label="How Vodora works">
      <div className="flex w-full flex-col md:flex-row items-center justify-center md:items-start md:justify-between">
        {HERO_WORKFLOW_STEPS.map((step, index) => (
          <HeroWorkflowStep
            key={step.id}
            title={step.title}
            subTitle={step.subTitle}
            isLast={index === HERO_WORKFLOW_STEPS.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
