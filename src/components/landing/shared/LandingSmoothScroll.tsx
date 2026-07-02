"use client";

import { useEffect, type ReactNode } from "react";

const LANDING_SCROLL_CLASS = "landing-page-scroll";

export function LandingSmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add(LANDING_SCROLL_CLASS);
    return () => {
      document.documentElement.classList.remove(LANDING_SCROLL_CLASS);
    };
  }, []);

  return <>{children}</>;
}
