import { ArrowLeft, ArrowRight } from "lucide-react";

import { ClipButton } from "@/components/ui/Button";

interface VerificationNavProps {
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly canGoPrev: boolean;
  readonly canGoNext: boolean;
}

function preventSelection(event: React.MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

export function VerificationNav({
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: VerificationNavProps) {
  return (
    <div className="flex select-none items-end rounded-lg p-1">
      <ClipButton
        icon={<ArrowLeft className="h-4 w-4" />}
        variant="outline"
        clipPosition="left"
        size="md"
        aria-label="Previous verification layer"
        disabled={!canGoPrev}
        onMouseDown={preventSelection}
        onClick={onPrev}
        className="[&>span]:overflow-hidden [&>span]:rounded-lg  [&_span_span]:!bg-white [&_span_span]:!text-[#1D8B8A] hover:[&_span_span]:!bg-[#EBF5F5]"
      />
      <ClipButton
        icon={<ArrowRight className="h-4 w-4" />}
        variant="primary"
        clipPosition="right"
        size="md"
        aria-label="Next verification layer"
        disabled={!canGoNext}
        onMouseDown={preventSelection}
        onClick={onNext}
        className="-ml-2 [&>span]:overflow-hidden [&>span]:rounded-lg"
      />
    </div>
  );
}
