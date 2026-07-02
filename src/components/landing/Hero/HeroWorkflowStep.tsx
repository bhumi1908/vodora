import { Check } from "lucide-react";

interface HeroWorkflowStepProps {
  readonly title: string;
  readonly subTitle: string;
  readonly isLast?: boolean;
}

export function HeroWorkflowStep({
  title,
  subTitle,
  isLast = false,
}: HeroWorkflowStepProps) {
  return (
    <div
      role="listitem"
      className="relative w-full items-center sm:items-start pb-5 last:pb-0 md:min-w-0 md:flex-1 md:flex-col md:pb-0"
    >
      <div className="flex sm:items-start gap-3 md:block">
        <div className="relative shrink-0 md:flex md:h-7 md:w-full md:items-center">
          {!isLast && (
            <div
              className="absolute left-1/2 top-6 bottom-[-1.25rem] w-px -translate-x-1/2 bg-white md:hidden"
              aria-hidden="true"
            />
          )}

          <div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1D8B8A] md:size-7">
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
              className="absolute top-1/2 left-6 right-0 hidden h-px -translate-y-1/2 bg-white md:block md:left-7"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 pt-0.5 md:mt-5 md:max-w-[240px] md:px-1">
          <p className="text-sm font-bold leading-snug text-white md:whitespace-nowrap md:text-base md:font-normal  lg:text-[18px]">
            {title}
          </p>
          <p className="text-sm font-bold leading-snug text-white md:whitespace-nowrap md:text-base md:font-normal lg:text-[18px]">
            {subTitle}
          </p>
        </div>
      </div>
    </div>
  );
}
