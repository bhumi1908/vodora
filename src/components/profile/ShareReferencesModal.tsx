"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { StaticWorkInProgressNotice } from "@/components/profile/StaticWorkInProgressNotice";

type ShareReferencesModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ShareReferencesModal({
  open,
  onClose,
}: ShareReferencesModalProps) {
  useEffect(() => {
    if (!open) {
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
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close share references modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-references-title"
        className="relative z-10 w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2
            id="share-references-title"
            className="text-lg font-semibold text-gray-900"
          >
            Share References
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <StaticWorkInProgressNotice section="Share References" />

          <p className="text-sm leading-relaxed text-gray-600">
            Reference sharing will let you generate a secure link to your
            verified references. This preview uses placeholder content while the
            feature is being built.
          </p>

          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            Share link preview: vodora.app/share/example-reference-passport
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            disabled
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-60"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
