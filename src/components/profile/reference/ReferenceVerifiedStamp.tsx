"use client";

import { useId } from "react";

import { formatReferenceDateTime } from "@/lib/profile/format";

type ReferenceVerifiedStampProps = {
  verifiedAt: string | null;
};

export function ReferenceVerifiedStamp({
  verifiedAt,
}: ReferenceVerifiedStampProps) {
  const noiseFilterId = useId();
  const verifiedAtLabel = formatReferenceDateTime(verifiedAt);

  return (
    <div
      className="relative shrink-0 select-none"
      aria-label={
        verifiedAtLabel ? `Verified on ${verifiedAtLabel}` : "Verified"
      }
    >
      <div className="-rotate-6 sm:-rotate-8">
        <div className="relative overflow-hidden rounded-md border-2 border-green-700/80 p-[3px]">
          <div className="relative overflow-hidden rounded-sm border-2 border-green-700/80 px-3 py-2 text-center sm:px-4 sm:py-2.5">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full text-green-700 opacity-[0.14]"
              aria-hidden="true"
            >
              <filter id={noiseFilterId}>
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.85"
                  numOctaves="3"
                  stitchTiles="stitch"
                />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect
                width="100%"
                height="100%"
                fill="currentColor"
                filter={`url(#${noiseFilterId})`}
              />
            </svg>

            <p className="relative text-sm font-extrabold tracking-[0.2em] text-green-700 sm:text-base">
              VERIFIED
            </p>
            {verifiedAtLabel ? (
              <p className="relative mt-1 text-[10px] font-semibold uppercase leading-tight tracking-wide text-green-700/90 sm:text-[11px]">
                {verifiedAtLabel}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
