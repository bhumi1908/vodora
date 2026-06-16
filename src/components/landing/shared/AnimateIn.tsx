"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type AnimateVariant =
  | "fade-up"
  | "fade-in"
  | "fade-left"
  | "fade-right"
  | "scale-in";

interface AnimateInProps {
  children: ReactNode;
  variant?: AnimateVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  /** Play on mount (hero sections) instead of waiting for scroll */
  immediate?: boolean;
}

export function AnimateIn({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 650,
  className = "",
  once = true,
  immediate = false,
}: AnimateInProps) {
  "use no memo";

  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (immediate) {
      const timer = window.setTimeout(() => setVisible(true), delay + 50);
      return () => window.clearTimeout(timer);
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay, immediate, once]);

  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
  };

  const animationClass = `animate-in animate-in-${variant}`;
  const visibleClass = visible ? "animate-in-visible" : "";
  const mergedClassName = [animationClass, visibleClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} style={style} className={mergedClassName}>
      {children}
    </div>
  );
}
