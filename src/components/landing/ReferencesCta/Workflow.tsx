import { WORKFLOW_STEPS } from "./constants";
import { WorkflowCard } from "./WorkflowCard";

export function Workflow() {
  return (
    <div
      className="pb-1 w-full"
      role="list"
      aria-label="How Vodora works"
    >
      <div className="flex min-w-full items-stretch gap-2 flex-wrap flex-col sm:flex-row">
        {WORKFLOW_STEPS.map((step, index) => (
          <div key={step.id} role="listitem" className="flex w-full flex-1">
            <WorkflowCard
              title={step.title}
              isFirstCard={index === 0}
              isLastCard={index === WORKFLOW_STEPS.length - 1}
              subTitle={step.subTitle}
            />
          </div>
        ))}
      </div>
    </div>
  );
}