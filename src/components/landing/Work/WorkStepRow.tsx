"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { ClipButton } from "@/components/ui/Button";

import type { WorkStepItem } from "./constants";

interface WorkStepRowProps {
  readonly step: WorkStepItem;
  readonly isLast?: boolean;
}

export function WorkStepRow({ step, isLast = false }: WorkStepRowProps) {
  const router = useRouter();

  function handleAction() {
    router.push(step.buttonHref);
  }

  return (
    <div
      className={[
        "flex flex-1 items-start gap-3 px-4 py-5 sm:items-center sm:justify-center sm:gap-8 sm:px-10 sm:py-0 lg:gap-10",
        !isLast ? "border-b border-[#CCCCCC]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="shrink-0">
        <Image
          src={encodeURI(step.iconSrc)}
          alt=""
          width={46}
          height={46}
          className="h-10 w-10 sm:h-11 sm:w-11"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold leading-snug text-black text-xl sm:text-[21px] w-fit leading-[21px]">
          {step.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-black sm:pr-10 sm:text-[19px]">
          {step.description}
        </p>
      </div>

      <ClipButton
        icon={<ArrowRight className="h-4 w-4" />}
        variant="primary"
        clipPosition="right"
        size="md"
        aria-label={step.buttonAriaLabel}
        onClick={handleAction}
        className="mt-1 shrink-0 sm:mt-0"
      />
    </div>
  );
}
