"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseHorizontalCarouselOptions {
  readonly itemCount: number;
}

export function useHorizontalCarousel({
  itemCount,
}: UseHorizontalCarouselOptions) {
  const [offset, setOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const [slideStep, setSlideStep] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);

  const measure = useCallback(() => {
    const slide = slideRef.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!slide || !track || !viewport) return;

    const slideWidth = slide.offsetWidth;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    const step = slideWidth + gap;
    const trackWidth = itemCount * slideWidth + (itemCount - 1) * gap;
    const viewportWidth = viewport.offsetWidth;
    const max = Math.max(0, trackWidth - viewportWidth);

    setSlideStep(step);
    setMaxOffset(max);
    setOffset((current) => Math.min(current, max));
  }, [itemCount]);

  useEffect(() => {
    measure();

    window.addEventListener("resize", measure);

    const observer = new ResizeObserver(measure);
    if (slideRef.current) observer.observe(slideRef.current);
    if (trackRef.current) observer.observe(trackRef.current);
    if (viewportRef.current) observer.observe(viewportRef.current);

    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [measure]);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
  }, []);

  const goNext = useCallback(() => {
    if (slideStep <= 0) return;
    clearSelection();
    setOffset((current) => Math.min(current + slideStep, maxOffset));
  }, [slideStep, maxOffset, clearSelection]);

  const goPrev = useCallback(() => {
    if (slideStep <= 0) return;
    clearSelection();
    setOffset((current) => Math.max(current - slideStep, 0));
  }, [slideStep, clearSelection]);

  const canGoPrev = offset > 0;
  const canGoNext = offset < maxOffset - 1;

  return {
    offset,
    goNext,
    goPrev,
    canGoPrev,
    canGoNext,
    trackRef,
    viewportRef,
    slideRef,
  };
}
