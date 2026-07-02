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
        "flex w-full min-w-0 flex-1 items-start gap-4  py-5 sm:gap-5 sm:py-6 md:items-center md:gap-6 md:py-7 lg:gap-7  lg:py-8 xl:gap-10 pl-4 md:pl-8",
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
        <h3 className=" font-bold  text-black text-[16px] sm:text-[21px] w-fit leading-[21px] !leading-[29px]">
          {step.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-black sm:text-base md:pr-2 lg:pr-6 lg:text-[19px] xl:pr-10">
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
        className="mt-0.5 shrink-0 self-start md:self-center"
      />
    </div>
  );
}
