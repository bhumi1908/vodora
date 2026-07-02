import { Check } from "lucide-react";

interface HeroWorkflowStepProps {
  readonly title: string;
  readonly subTitle: string;
  readonly index: number;
  readonly isLast?: boolean;
}

const ANIMATION_BASE_MS = 420;
const ANIMATION_STAGGER_MS = 160;

function getStepDelays(index: number) {
  const base = ANIMATION_BASE_MS + index * ANIMATION_STAGGER_MS;

  return {
    dot: base,
    text: base + 70,
    line: base + 120,
  };
}

export function HeroWorkflowStep({
  title,
  subTitle,
  index,
  isLast = false,
}: HeroWorkflowStepProps) {
  const delays = getStepDelays(index);

  return (
    <div
      role="listitem"
      className="relative w-full items-center sm:items-start pb-5 last:pb-0 md:min-w-0 md:flex-1 md:flex-col md:pb-0"
    >
      <div className="flex items-start gap-3 md:block">
        <div className="relative shrink-0 md:flex md:h-7 md:w-full md:items-center">
          {!isLast && (
            <div
              className="hero-workflow-line-v absolute left-1/2 top-6 bottom-[-1.25rem] w-px bg-white md:hidden"
              style={{ animationDelay: `${delays.line}ms` }}
              aria-hidden="true"
            />
          )}

          <div
            className="hero-workflow-dot-in relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1D8B8A] md:size-7"
            style={{ animationDelay: `${delays.dot}ms` }}
          >
            {isLast ? (
              <div
                className="flex size-3 items-center justify-center rounded-full bg-white sm:size-3.5"
                aria-hidden="true"
              >
                <Check
                  className="size-2 text-[#1D8B8A] sm:size-2.5"
                  strokeWidth={2}
                />
              </div>
            ) : (
              <div
                className="size-2.5 rounded-full bg-white sm:size-3"
                aria-hidden="true"
              />
            )}
          </div>

          {!isLast && (
            <div
              className="hero-workflow-line-h absolute top-1/2 left-6 right-0 hidden h-px bg-white md:block md:left-7"
              style={{ animationDelay: `${delays.line}ms` }}
              aria-hidden="true"
            />
          )}
        </div>

        <div
          className="hero-workflow-text-in min-w-0 flex-1 pt-0.5 md:mt-5 md:max-w-[240px] md:px-1"
          style={{ animationDelay: `${delays.text}ms` }}
        >
          <p className="text-sm font-bold leading-snug text-white md:hidden">
            {title} {subTitle}
          </p>
          <p className="hidden text-base font-normal leading-snug text-white md:block lg:text-base xl:text-[17px]">
            {title}
          </p>
          <p className="hidden text-base font-normal leading-snug text-white md:block lg:text-base xl:text-[17px]">
            {subTitle}
          </p>
        </div>
      </div>
    </div>
  );
}
