"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const MODAL_ANIMATION_MS = 220;

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  maxWidthClassName?: string;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidthClassName = "max-w-lg",
}: ModalProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);

      if (prefersReducedMotion()) {
        setVisible(true);
        return;
      }

      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setVisible(true);
        });
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!mounted || visible) {
      return;
    }

    const duration = prefersReducedMotion() ? 0 : MODAL_ANIMATION_MS;
    const timer = window.setTimeout(() => {
      setMounted(false);
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mounted, visible]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mounted, onClose]);

  if (!mounted) {
    return null;
  }

  const titleId = `${title.toLowerCase().replace(/\s+/g, "-")}-modal-title`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={`Close ${title} modal`}
        className={`modal-backdrop absolute inset-0 bg-black/40 ${
          visible ? "modal-backdrop-visible" : ""
        }`}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`modal-panel relative z-10 flex max-h-[90vh] w-full flex-col rounded-lg border border-gray-200 bg-white shadow-xl ${maxWidthClassName} ${
          visible ? "modal-panel-visible" : ""
        }`}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="min-w-0 pr-4">
            <h2
              id={titleId}
              className="text-lg font-semibold text-gray-900 sm:text-xl"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {children ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {children}
          </div>
        ) : null}

        {footer ? (
          <div className="shrink-0 border-t border-gray-200 px-4 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
