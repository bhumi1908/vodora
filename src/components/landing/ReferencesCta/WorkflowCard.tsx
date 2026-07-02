import { ArrowRight } from "lucide-react";

interface WorkflowCardProps {
  readonly title: string;
  readonly isFirstCard?: boolean;
  readonly isLastCard?: boolean;
  readonly subTitle: string;
}

export function WorkflowCard({
  title,
  isFirstCard = false,
  isLastCard = false,
  subTitle,
}: WorkflowCardProps) {
  return (
    <div className="relative flex shrink-0 items-center">
      <div className="relative flex min-h-[80px] w-[260px] shrink-0 items-center justify-center rounded-lg border border-white px-6 text-center sm:min-h-[150px] sm:w-[300px] sm:px-12 lg:min-h-[140px] xl:min-h-[160px]">
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-bold leading-snug text-white sm:text-xl">
            {title}
          </p>
          <p className="text-center text-sm font-normal leading-snug text-white sm:text-[18px]">
            {subTitle}
          </p>
        </div>

        {!isFirstCard && (
          <div className="absolute top-1/2 left-0 z-10 h-10 w-5 -translate-y-1/2 overflow-hidden sm:h-15 sm:w-7 rotate-180">
            <div className="size-10 rounded-full border border-white bg-[#1D8B8A] sm:size-15" />
          </div>
        )}

        {!isLastCard && (
          <div className="absolute top-1/2 right-0 z-10 h-10 w-5 -translate-y-1/2 overflow-hidden sm:h-15 sm:w-7">
            <div className="size-10 rounded-full border border-white bg-[#1D8B8A] sm:size-15" />
          </div>
        )}
      </div>

      {!isLastCard && (
        <div className="absolute top-1/2 right-[-20px] z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white backdrop-blur-sm sm:right-[-26px] sm:h-11 sm:w-11">
          <ArrowRight className="h-3.5 w-3.5 text-[#1D8B8A]" />
        </div>
      )}
    </div>
  );
}
