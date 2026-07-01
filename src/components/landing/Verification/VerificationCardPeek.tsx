import Image from "next/image";

import type { VerificationCardConfig } from "./constants";
interface VerificationCardPeekProps {
  readonly card: VerificationCardConfig;
}

export function VerificationCardPeek({ card }: VerificationCardPeekProps) {
  return (
    <article
      aria-hidden="true"
      className="flex h-full flex-col overflow-hidden rounded-xl bg-white p-5  sm:p-6 lg:p-4"
    >
      <div className="relative min-h-[180px] flex-1 rounded-2xl sm:min-h-[220px] lg:min-h-0">
        <Image
          src={encodeURI(card.imageSrc)}
          alt=""
          fill
          sizes="(max-width: 640px) 35vw, (max-width: 620px) 620px, 420px"
          className="rounded-xl object-cover object-left"
        />
      </div>
    </article>
  );
}
