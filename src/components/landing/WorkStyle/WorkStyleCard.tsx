import Image from "next/image";

import type { WorkStyleCardConfig } from "./constants";

interface WorkStyleCardProps {
  readonly card: WorkStyleCardConfig;
}

export function WorkStyleCard({ card }: WorkStyleCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden">
      <div
        className="relative w-full shrink-0 overflow-hidden bg-white"
        style={{ aspectRatio: `${card.imageWidth}/${card.imageHeight}` }}
      >
        <Image
          src={encodeURI(card.imageSrc)}
          alt={card.imageAlt}
          width={card.imageWidth}
          height={card.imageHeight}
          draggable={false}
          className="pointer-events-none h-full w-full select-none object-cover object-center"
        />
      </div>

      <div className="flex flex-1 flex-col bg-[#F1F2F4] px-5 py-5 sm:px-4 sm:py-6">
        <h3 className="text-lg font-bold leading-snug text-black sm:text-xl">
          {card.title}
        </h3>
        <p className="mt-2 text-sm font-normal leading-relaxed text-[#6B7280] sm:text-base">
          {card.description}
        </p>
      </div>
    </article>
  );
}
