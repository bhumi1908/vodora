import { ArrowRight } from "lucide-react";

interface WorkflowCardProps {
  readonly title: string;
  readonly isFirstCard?: boolean;
  readonly isLastCard?: boolean;
}

export function WorkflowCard({ title, isFirstCard = false, isLastCard = false }: WorkflowCardProps) {
  return (
    <div className="flex shrink-0 items-center relative">
      <div className="flex min-h-[80px] sm:min-h-[100px] lg:min-h-[130px] xl:min-h-[150px] w-full items-center rounded-lg border border-white px-12 text-center justify-center sm:w-[250px] relative">
        <p className="text-sm sm:text-xl font-bold leading-snug text-white">{title}</p>
        {!isFirstCard && (
          <div className="absolute top-[-11px] sm:top-1/2 translate-y-0 sm:-translate-y-1/2 left-1/2 sm:-left-px -translate-x-1/2 sm:translate-x-0 h-10 sm:h-15 w-5 sm:w-7 overflow-hidden z-10 -rotate-90 sm:rotate-180">
            <div className="size-10 sm:size-15 rounded-full border border-white bg-black" />
          </div>
        )}
        {!isLastCard && (
          <div className="absolute top-[calc(100%+11px)] sm:top-1/2 -translate-y-full sm:-translate-y-1/2 right-1/2 sm:-right-px translate-x-1/2 sm:translate-x-0 h-10 sm:h-15 w-5 sm:w-7 overflow-hidden z-10 rotate-90 sm:rotate-0">
            <div className="size-10 sm:size-15 rounded-full border border-white bg-black" />
          </div>
        )}
      </div>

      {!isLastCard && (
        <div className="flex h-8 sm:h-11 w-8 sm:w-11 shrink-0 items-center justify-center rounded-full bg-white backdrop-blur-sm absolute right-1/2 sm:right-[-26px] translate-x-1/2 sm:translate-x-0 bottom-[-20px] sm:bottom-auto z-20">
          <ArrowRight className="h-3.5 w-3.5 text-[#1D8B8A] sm:rotate-0 rotate-90" />
        </div>
      )}
    </div>
  );
}