"use client";

import { Loader2 } from "lucide-react";

import { Modal } from "@/components/ui/Modal";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  confirmVariant?: "primary" | "danger";
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Yes",
  cancelLabel = "No",
  isConfirming = false,
  confirmVariant = "primary",
}: ConfirmDialogProps) {
  const confirmClassName =
    confirmVariant === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      maxWidthClassName="max-w-md"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${confirmClassName}`}
          >
            {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      }
    />
  );
}
