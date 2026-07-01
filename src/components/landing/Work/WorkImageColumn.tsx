import Image from "next/image";

import { HOW_IT_WORKS } from "./constants";

export function WorkImageColumn() {
  return (
    <div className="my-6 flex shrink-0 items-center justify-center self-stretch py-6 pr-0 sm:my-12 sm:py-8 lg:items-stretch lg:py-0 lg:pr-10 xl:pr-12">
      <Image
        src={HOW_IT_WORKS.imageSrc}
        alt={HOW_IT_WORKS.imageAlt}
        width={HOW_IT_WORKS.imageWidth}
        height={HOW_IT_WORKS.imageHeight}
        className="h-auto w-auto max-h-[300px] object-contain sm:max-h-[380px] lg:h-full lg:max-h-none lg:min-h-[480px]"
      />
    </div>
  );
}
