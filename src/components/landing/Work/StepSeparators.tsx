import { HOW_IT_WORKS, WORK_STEPS } from "./constants";
import { WorkStepRow } from "./WorkStepRow";

export function StepSeparators() {
  const emptyRowCount = HOW_IT_WORKS.separatorCount - WORK_STEPS.length;

  return (
    <div className="flex min-h-[200px] w-full flex-1 flex-col pl-0 sm:min-h-[320px] lg:min-h-[480px]">
      {WORK_STEPS.map((step, index) => (
        <WorkStepRow
          key={step.id}
          step={step}
          isLast={index === WORK_STEPS.length - 1 && emptyRowCount === 0}
        />
      ))}

      {Array.from({ length: emptyRowCount }, (_, index) => (
        <div
          key={`empty-${index}`}
          aria-hidden="true"
          className={
            index < emptyRowCount - 1
              ? "flex-1 border-b border-[#CCCCCC]"
              : "flex-1"
          }
        />
      ))}
    </div>
  );
}
