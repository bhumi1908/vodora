import { Check } from "lucide-react";

interface HeroWorkflowStepProps {
  readonly title: string;
  readonly subTitle: string;
  readonly isFirst?: boolean;
  readonly isLast?: boolean;
}

export function HeroWorkflowStep({
  title,
  subTitle,
  isFirst = false,
  isLast = false,
}: HeroWorkflowStepProps) {
  return (
    <div role="listitem" className="relative flex min-w-0 flex-1 flex-col ">
      <div className="relative flex h-7 w-full items-center">
        <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1D8B8A]">
          {isLast ? (
            <div
              className="flex size-3.5 items-center justify-center rounded-full bg-white"
              aria-hidden="true"
            >
              <Check className="size-2.5 text-[#1D8B8A]" strokeWidth={2} />
            </div>
          ) : (
            <div className="size-3 rounded-full bg-white" aria-hidden="true" />
          )}
        </div>

        {!isLast && (
          <div
            className="absolute top-1/2 right-[-20px] left-[20px] h-px -translate-y-1/2 bg-white"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="mt-5 w-full min-w-[140px] max-w-[200px] px-1  sm:min-w-[160px] sm:max-w-[220px]">
        <p className="whitespace-nowrap text-sm font-bold leading-snug text-white sm:text-base lg:text-[18px]">
          {title}
        </p>
        <p className="whitespace-nowrap text-sm font-bold leading-snug text-white sm:text-base lg:text-[18px]">
          {subTitle}
        </p>
      </div>
    </div>
  );
}
