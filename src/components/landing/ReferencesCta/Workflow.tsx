import { WORKFLOW_STEPS } from "./constants";
import { WorkflowCard } from "./WorkflowCard";

const SCROLL_ROW_CLASS =
  "-mx-4 flex items-stretch gap-2 overflow-x-auto overscroll-x-contain px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 2xl:justify-center 2xl:overflow-x-visible 2xl:pb-1 [&::-webkit-scrollbar]:hidden";

export function Workflow() {
  return (
    <div className="w-full min-w-0 pb-1" role="list" aria-label="How Vodora works">
      <div className={SCROLL_ROW_CLASS}>
        {WORKFLOW_STEPS.map((step, index) => (
          <div key={step.id} role="listitem" className="flex shrink-0">
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
