/*
 * Usage examples:
 *   <ClipButton text="Create Profile Today" icon={<ArrowRight className="h-4 w-4" />} variant="outline" onClick={handleClick} />
 *   <ClipButton text="Contact Us Today" icon={<ArrowRight className="h-4 w-4" />} variant="primary" onClick={handleContact} />
 *   <ClipButton icon={<ArrowRight className="h-4 w-4" />} variant="primary" aria-label="Next slide" onClick={handleNext} />
 *   <ClipButton icon={<ArrowLeft className="h-4 w-4" />} variant="secondary" aria-label="Previous" onClick={handlePrev} />
 *
 * Icon-only usage requires the consumer to pass an aria-label for accessibility.
 */

import React from "react";

export interface ClipButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  clipPosition?: "left" | "right";
  variant?: "primary" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
}

type SizeKey = "sm" | "md" | "lg";

const sizeMap: Record<
  SizeKey,
  { textPad: string; font: string; iconW: string; minH: string }
> = {
  sm: {
    textPad: "px-3 py-2",
    font: "text-xs",
    iconW: "w-9",
    minH: "min-h-[36px]",
  },
  md: {
    textPad: "px-4 py-3",
    font: "text-sm",
    iconW: "w-11",
    minH: "min-h-[44px]",
  },
  lg: {
    textPad: "px-5 py-3.5",
    font: "text-base",
    iconW: "w-12",
    minH: "min-h-[48px]",
  },
};

const CLIP_RIGHT = "polygon(12px 0%, 100% 0%, 100% 100%, 0% 100%)";
const CLIP_LEFT = "polygon(0% 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)";

function textBlockClasses(variant: ClipButtonProps["variant"], sz: (typeof sizeMap)[SizeKey]): string {
  const base = `flex items-center rounded-md uppercase tracking-widest transition-colors duration-150 ${sz.textPad} ${sz.font}`;
  if (variant === "primary") {
    return `${base} bg-[#1D8B8A] text-white group-hover:bg-[#166F6E] group-active:bg-[#125E5D]`;
  }
  if (variant === "outline") {
    return `${base} bg-white text-[#1D8B8A] group-hover:bg-[#EBF5F5] group-active:bg-[#D6ECEC]`;
  }
  return base;
}

function iconWrapperClasses(sz: (typeof sizeMap)[SizeKey], hasText: boolean): string {
  return `shrink-0 overflow-hidden rounded-md ${sz.iconW}${!hasText ? ` ${sz.minH}` : ""}`;
}

function iconInnerClasses(variant: ClipButtonProps["variant"]): string {
  const base = "flex h-full w-full items-center justify-center transition-colors duration-150";
  if (variant === "secondary") {
    return `${base} bg-[#F1F3F4] text-[#1D8B8A] group-hover:bg-[#E2E5E7] group-active:bg-[#D5D9DB]`;
  }
  return `${base} bg-[#1D8B8A] text-white group-hover:bg-[#166F6E] group-active:bg-[#125E5D]`;
}

/**
 * Branded button with a clipped icon block. Supports three visual variants
 * (primary, outline, secondary), optional text label, and a left- or right-
 * aligned icon. When used without a text prop the component renders a square
 * icon-only touch target (≥ 44 px tall at the md baseline).
 *
 * Icon-only usage MUST include an aria-label prop for screen readers.
 */
export const ClipButton = React.forwardRef<HTMLButtonElement, ClipButtonProps>(
  function ClipButton(
    {
      text,
      icon,
      iconPosition = "right",
      clipPosition = "left",
      variant = "primary",
      size = "md",
      disabled,
      className,
      onClick,
      ...rest
    },
    ref,
  ) {
    const sz = sizeMap[size ?? "md"];
    const hasText = Boolean(text);
    const hasIcon = Boolean(icon);
    const clip = clipPosition === "left" ? CLIP_LEFT : CLIP_RIGHT;

    const rootClass = [
      "group inline-flex items-stretch gap-1.5 cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D8B8A] focus-visible:ring-offset-2",
      "transition-transform duration-150 active:scale-[0.98]",
      disabled ? "opacity-50 cursor-not-allowed" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    const iconEl = hasIcon ? (
      // Outer span: rounded-md + overflow-hidden applies border-radius to the clipped shape.
      // Inner span: clip-path draws the diagonal cut. Both effects compose correctly.
      <span className={iconWrapperClasses(sz, hasText)} aria-hidden="true">
        <span
          className={iconInnerClasses(variant)}
          style={{ clipPath: clip }}
        >
          {icon}
        </span>
      </span>
    ) : null;

    const textEl = hasText ? (
      <span
        className={textBlockClasses(variant, sz)}
        style={!hasIcon ? { clipPath: clip } : undefined}
      >
        {text}
      </span>
    ) : null;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-disabled={disabled}
        onClick={onClick}
        className={rootClass}
        {...rest}
      >
        {iconPosition === "left" ? (
          <>
            {iconEl}
            {textEl}
          </>
        ) : (
          <>
            {textEl}
            {iconEl}
          </>
        )}
      </button>
    );
  },
);

ClipButton.displayName = "ClipButton";
