import Image from "next/image";
import Link from "next/link";

import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { FooterColumn } from "./FooterColumn";
import {
  FOOTER_COLUMNS,
  FOOTER_COPYRIGHT,
  FOOTER_SECURITY,
} from "./constants";

export function LandingFooter() {
  return (
    <footer
      aria-label="Site footer"
      className="bg-black py-12 text-white sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start  lg:gap-16 sm:gap-24 xl:gap-24">
          <AnimateIn variant="fade-up">
            <Link
              href="/"
              aria-label="Vodora home"
              className="inline-block shrink-0"
            >
              <Image
                src="/Images/logo-svg.svg"
                alt="Vodora"
                width={176}
                height={28}
                className="h-6 w-auto sm:h-7 lg:h-8"
              />
            </Link>
          </AnimateIn>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10 lg:gap-14 xl:gap-20 mb-10 justify-between w-full">
            {FOOTER_COLUMNS.map((column, index) => (
              <AnimateIn key={column.title} delay={index * 80} variant="fade-up">
                <FooterColumn column={column} />
              </AnimateIn>
            ))}
          </div>
        </div>

        <div
          className=" h-px w-full bg-white "
          aria-hidden="true"
        />

        <AnimateIn delay={200} variant="fade-up">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8 pt-4">
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <p className="text-sm font-normal text-[#468284] sm:text-base">
                {FOOTER_SECURITY.heading}
              </p>
              <Link
                href={FOOTER_SECURITY.linkHref}
                className="text-sm font-normal text-[#468284] transition-opacity hover:opacity-80 sm:text-base"
              >
                {FOOTER_SECURITY.linkLabel}
              </Link>
            </div>

            <p className="shrink-0 self-start text-sm font-normal text-white sm:text-base lg:text-right">
              {FOOTER_COPYRIGHT}
            </p>
          </div>
        </AnimateIn>
      </div>
    </footer>
  );
}
