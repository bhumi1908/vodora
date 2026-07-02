import Image from "next/image";

import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { poppins } from "../Work/fonts";
import { REFERENCES_CTA_BG } from "./constants";
import { ReferencesCtaContent } from "./ReferencesCtaContent";

export function ReferencesCtaSection() {
  return (
    <section
      aria-label="References verified once, used forever"
      className={`relative overflow-hidden w-full min-w-0 py-12 sm:py-16 lg:py-20 bg-[#1D8B8A] ${poppins.className}`}
    >
      <Image
        src={REFERENCES_CTA_BG}
        alt=""
        fill
        className="object-cover object-center opacity-40"
        sizes="100vw"
      />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <AnimateIn variant="fade-up">
          <ReferencesCtaContent />
        </AnimateIn>
      </div>
    </section>
  );
}
