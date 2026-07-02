import Image from "next/image";

import { HOW_IT_WORKS } from "./constants";

export function WorkImageColumn() {
  return (
    <div className="flex w-full shrink-0 items-center justify-center py-8 sm:py-10 lg:my-12 lg:w-auto lg:items-stretch lg:self-stretch lg:py-0 lg:pr-10 xl:pr-12">
      <div className="flex h-20 w-full items-center justify-center overflow-hidden sm:h-24 lg:h-auto lg:w-auto lg:overflow-visible">
        <Image
          src={HOW_IT_WORKS.imageSrc}
          alt={HOW_IT_WORKS.imageAlt}
          width={HOW_IT_WORKS.imageWidth}
          height={HOW_IT_WORKS.imageHeight}
          className="h-[min(72vw,300px)]  w-auto max-w-none rotate-90 object-contain sm:h-[min(68vw,340px)] lg:h-full lg:max-h-none lg:min-h-[480px] lg:rotate-0 lg:w-auto"
        />
      </div>
    </div>
  );
}
