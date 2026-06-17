"use client";

import { CheckCircle } from "lucide-react";
import { useState } from "react";

import { RequestReferenceForm } from "@/components/profile/reference/RequestReferenceForm";
import type { RequestReferenceFormData } from "@/components/profile/reference/types";
import { Modal } from "@/components/ui/Modal";

type RequestReferenceModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (data: RequestReferenceFormData) => void;
};

export function RequestReferenceModal({
  open,
  onClose,
  onSubmitted,
}: RequestReferenceModalProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    setSubmitted(false);
    onClose();
  }

  function handleSubmitted(data: RequestReferenceFormData) {
    setSubmitted(true);
    onSubmitted?.(data);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={submitted ? "Request Sent" : "Request Reference"}
      description={
        submitted
          ? undefined
          : "An email will be sent to request their reference"
      }
      maxWidthClassName="max-w-2xl"
    >
      {submitted ? (
        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">
            Your reference request has been prepared. Email delivery will be
            enabled once the backend is connected.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
          >
            Done
          </button>
        </div>
      ) : (
        <RequestReferenceForm onCancel={handleClose} onSubmitted={handleSubmitted} />
      )}
    </Modal>
  );
}
