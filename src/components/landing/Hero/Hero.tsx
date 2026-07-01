import Image from "next/image";

import { HeroContent } from "./HeroContent";
import { Workflow } from "./Workflow";

export function Hero() {
  return (
    <section
      className="relative flex min-h-screen flex-col overflow-hidden bg-black"
      aria-label="Hero"
    >
      <Image
        src="/Images/hero-BG.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/65" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-10 sm:gap-20 justify-center flex-1 w-full mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center pt-20 sm:pt-16">
          <div className="w-full max-w-2xl">
            <HeroContent />
          </div>
        </div>
        

        <div className="pb-10">
          <Workflow />
        </div>
      </div>
    </section>
  );
}
