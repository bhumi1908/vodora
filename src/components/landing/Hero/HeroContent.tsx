"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ClipButton } from "@/components/ui/Button";
import { AVATAR_IMAGES, HERO_CONTENT } from "./constants";

export function HeroContent() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-[3.5rem] xl:text-7xl">
        {HERO_CONTENT.headlineLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>

      <p className="max-w-md text-md leading-relaxed text-gray-300 sm:max-w-2xl sm:text-xl">
        {HERO_CONTENT.description}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-end">
          <ClipButton
            text={HERO_CONTENT.primaryCta.text}
            variant="outline"
            clipPosition="left"
            size="md"
            onClick={() => router.push(HERO_CONTENT.primaryCta.href)}
          />
          <ClipButton
            icon={<ArrowRight className="h-4 w-4" />}
            variant="outline"
            clipPosition="right"
            className="-ml-2"
            size="md"
            onClick={() => router.push(HERO_CONTENT.primaryCta.href)}
          />
        </div>
        <Link
          href={HERO_CONTENT.secondaryCta.href}
          className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:text-[#1D8B8A]"
        >
          {HERO_CONTENT.secondaryCta.text}
          <ArrowRight className="h-3.5 w-3.5 text-[#1D8B8A]" />
        </Link>
      </div>

      <HeroStats />
    </div>
  );
}

function HeroStats() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex" aria-hidden="true">
        {AVATAR_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`relative h-8 w-8 overflow-hidden rounded-full border-2 border-black ${i !== 0 ? "-ml-2" : ""}`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-300">{HERO_CONTENT.socialProof}</p>
    </div>
  );
}
