import Image from "next/image";

import type { HireFeatureCardConfig } from "./constants";

type HireFeatureCardProps = HireFeatureCardConfig;

export function HireFeatureCard({
  title,
  descriptionLines,
  iconSrc,
}: HireFeatureCardProps) {
  return (
    <article className="flex h-full w-full flex-col justify-between bg-[#F4F4F4] p-6 sm:p-8 lg:h-[450px] lg:p-8 xl:h-[539px] xl:w-[434px] xl:shrink-0 xl:p-10">
      <div>
        <Image
          src={encodeURI(iconSrc)}
          alt=""
          width={47}
          height={47}
          className="h-11 w-11 sm:h-12 sm:w-12"
          aria-hidden="true"
        />
        <h3 className="mt-8 text-lg font-bold leading-snug text-black sm:mt-5 sm:text-xl">
          {title}
        </h3>
      </div>
      <p className="text-sm font-normal leading-relaxed text-black sm:text-base">
        {descriptionLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
    </article>
  );
}
