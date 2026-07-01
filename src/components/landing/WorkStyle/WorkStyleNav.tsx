import { ArrowLeft, ArrowRight } from "lucide-react";

import { ClipButton } from "@/components/ui/Button";

export function WorkStyleNav() {
  return (
    <div className="flex items-end rounded-lg p-1">
      <ClipButton
        icon={<ArrowLeft className="h-4 w-4" />}
        variant="outline"
        clipPosition="left"
        size="md"
        aria-label="Previous work style"
        className="[&>span]:overflow-hidden [&>span]:rounded-lg [&_span_span]:!bg-[#F1F2F4] [&_span_span]:!text-[#1D8B8A] hover:[&_span_span]:!bg-[#EBF5F5]"
      />
      <ClipButton
        icon={<ArrowRight className="h-4 w-4" />}
        variant="primary"
        clipPosition="right"
        size="md"
        aria-label="Next work style"
        className="-ml-2 [&>span]:overflow-hidden [&>span]:rounded-lg"
      />
    </div>
  );
}
