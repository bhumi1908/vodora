import { HERO_WORKFLOW_STEPS } from "./constants";
import { HeroWorkflowStep } from "./HeroWorkflowStep";

export function Workflow() {
  return (
    <div className="w-full" role="list" aria-label="How Vodora works">
      <div className="mx-auto flex w-full min-w-0 items-start justify-between">
        {HERO_WORKFLOW_STEPS.map((step, index) => (
          <HeroWorkflowStep
            key={step.id}
            title={step.title}
            subTitle={step.subTitle}
            isFirst={index === 0}
            isLast={index === HERO_WORKFLOW_STEPS.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
