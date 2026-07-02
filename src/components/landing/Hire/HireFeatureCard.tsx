import Image from "next/image";

import type { HireFeatureCardConfig } from "./constants";

type HireFeatureCardProps = HireFeatureCardConfig;

export function HireFeatureCard({
  title,
  descriptionLines,
  iconSrc,
}: HireFeatureCardProps) {
  return (
    <article className="flex h-full w-full min-h-[280px] flex-col justify-between rounded-lg bg-[#F4F4F4] p-6 sm:min-h-[300px] sm:p-8 lg:min-h-[420px] lg:p-8 xl:min-h-[450px]">
      <div>
        <Image
          src={encodeURI(iconSrc)}
          alt=""
          width={47}
          height={47}
          className="h-11 w-11 sm:h-12 sm:w-12"
          aria-hidden="true"
        />
        <h3 className="mt-5 text-lg font-bold leading-snug text-black sm:mt-6 sm:text-xl">
          {title}
        </h3>
      </div>
      <p className="mt-8 text-sm font-normal leading-relaxed text-black sm:mt-10 sm:text-base lg:mt-12">
        {descriptionLines.join(" ")}
      </p>
    </article>
  );
}
