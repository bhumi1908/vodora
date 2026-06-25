"use client";

import { CheckCircle, Clock3, Mail, Shield } from "lucide-react";
import { useEffect, useState } from "react";

import { RequestReferenceForm } from "@/components/profile/reference/RequestReferenceForm";
import type { RequestReferenceFormData } from "@/components/profile/reference/types";
import { Modal } from "@/components/ui/Modal";

type EmploymentHistoryOption = {
  id: string;
  label: string;
};

type RequestReferenceModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (data: RequestReferenceFormData) => void;
  employmentHistoryOptions?: EmploymentHistoryOption[];
};

function RequestSentSuccess({
  data,
}: {
  data: RequestReferenceFormData;
}) {
  const refereeName = data.name.trim();
  const refereeEmail = data.email.trim();
  const refereeCompany = data.company.trim();

  return (
    <div className="space-y-6">
      <div className="-mx-4 -mt-4 flex flex-col items-center bg-linear-to-b from-green-50 via-white to-white px-6 pb-2 pt-8 text-center sm:-mx-6 sm:-mt-5 sm:px-8 sm:pt-10">
        <div className="relative mb-5">
          <div className="absolute inset-0 scale-125 rounded-full bg-green-200/50" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-4 ring-white">
            <CheckCircle className="h-8 w-8 text-green-600" strokeWidth={2.25} />
          </div>
        </div>
        <p className="text-sm font-medium text-green-700">
          Your request is on its way
        </p>
      </div>

      <p className="text-center text-sm leading-relaxed text-gray-600">
        {refereeName ? (
          <>
            <span className="font-semibold text-gray-900">{refereeName}</span> will
            receive an email with a secure link to complete your reference.
          </>
        ) : (
          <>
            Your referee will receive an email with a secure link to complete your
            reference.
          </>
        )}
      </p>

      {refereeEmail || refereeCompany ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Sent to
          </p>
          <div className="space-y-2">
            {refereeName ? (
              <p className="text-sm font-semibold text-gray-900">{refereeName}</p>
            ) : null}
            {refereeCompany ? (
              <p className="text-sm text-gray-600">{refereeCompany}</p>
            ) : null}
            {refereeEmail ? (
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="break-all">{refereeEmail}</span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
          What happens next
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-sm text-gray-700">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
              <Mail className="h-3.5 w-3.5" />
            </span>
            <span>The referee receives a secure invitation email</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-gray-700">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
              <Shield className="h-3.5 w-3.5" />
            </span>
            <span>They verify their details and submit the reference</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-gray-700">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
              <Clock3 className="h-3.5 w-3.5" />
            </span>
            <span>It appears on your profile once verified</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function RequestReferenceModal({
  open,
  onClose,
  onSubmitted,
  employmentHistoryOptions = [],
}: RequestReferenceModalProps) {
  const [submittedData, setSubmittedData] =
    useState<RequestReferenceFormData | null>(null);

  const submitted = submittedData !== null;

  useEffect(() => {
    if (!open) {
      setSubmittedData(null);
    }
  }, [open]);

  function handleClose() {
    setSubmittedData(null);
    onClose();
  }

  function handleSubmitted(data: RequestReferenceFormData) {
    setSubmittedData(data);
    onSubmitted?.(data);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={submitted ? "Reference Request Sent" : "Request Reference"}
      description={
        submitted
          ? undefined
          : "An email will be sent to your referee with a secure link"
      }
      maxWidthClassName={submitted ? "max-w-md" : "max-w-2xl"}
      footer={
        submitted ? (
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Done
          </button>
        ) : undefined
      }
    >
      {submitted && submittedData ? (
        <RequestSentSuccess data={submittedData} />
      ) : (
        <RequestReferenceForm
          onCancel={handleClose}
          onSubmitted={handleSubmitted}
          employmentHistoryOptions={employmentHistoryOptions}
        />
      )}
    </Modal>
  );
}
