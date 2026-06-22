"use client";

import {
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Send,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { formatFileSize } from "@/lib/jobs/format-file-size";
import {
  showJobAppliedSuccessToast,
  showJobApplyErrorToast,
} from "@/lib/jobs/job-toast";
import type { CandidateJob } from "@/lib/jobs/candidate-jobs.types";
import {
  useJobApplyContextQuery,
  useSubmitJobApplicationMutation,
} from "@/lib/query/use-job-queries";
import { useUploadProfileDocumentMutation } from "@/lib/query/use-profile-mutations";

type JobApplyModalProps = {
  job: CandidateJob;
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
};

function formatUploadedDate(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function JobApplyModal({
  job,
  open,
  onClose,
  onApplied,
}: JobApplyModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [coverText, setCoverText] = useState("");
  const [coverLetterDocumentId, setCoverLetterDocumentId] = useState<
    string | null
  >(null);
  const [coverFileName, setCoverFileName] = useState("");
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);

  const {
    data: applyContext,
    isPending: isContextPending,
    isError: isContextError,
    error: contextError,
    refetch: refetchContext,
  } = useJobApplyContextQuery(job.id, open);

  const submitMutation = useSubmitJobApplicationMutation();
  const uploadMutation = useUploadProfileDocumentMutation();

  useEffect(() => {
    if (!open) {
      setStep("form");
      setCoverText("");
      setCoverLetterDocumentId(null);
      setCoverFileName("");
      setPendingCoverFile(null);
      return;
    }

    if (applyContext) {
      setCoverText(applyContext.coverLetter);
      setCoverLetterDocumentId(applyContext.coverLetterDocument?.id ?? null);
      setCoverFileName(applyContext.coverLetterDocument?.fileName ?? "");
      setPendingCoverFile(null);
    }
  }, [open, applyContext]);

  const handleClose = () => {
    setStep("form");
    onClose();
  };

  const handleApply = async () => {
    if (!applyContext?.resume) {
      showJobApplyErrorToast("Upload a resume to your profile before applying.");
      return;
    }

    if (!coverText.trim()) {
      showJobApplyErrorToast("Please write a cover letter before applying.");
      return;
    }

    let documentId = coverLetterDocumentId;

    if (pendingCoverFile) {
      const uploadResult = await uploadMutation.mutateAsync({
        file: pendingCoverFile,
        documentType: "cover_letter",
        isPrimary: true,
      });

      if (!uploadResult.success) {
        showJobApplyErrorToast(uploadResult.error);
        return;
      }

      documentId = uploadResult.document?.id ?? documentId;
      setCoverLetterDocumentId(documentId);
      setCoverFileName(pendingCoverFile.name);
      setPendingCoverFile(null);
    }

    try {
      const result = await submitMutation.mutateAsync({
        jobId: job.id,
        payload: {
          coverLetter: coverText,
          coverLetterDocumentId: documentId,
          referencesAttached: false,
        },
      });

      if (result.alreadyApplied) {
        showJobApplyErrorToast("You have already applied for this role.");
        onApplied();
        handleClose();
        return;
      }

      showJobAppliedSuccessToast(job.title);
      setStep("success");
      onApplied();
    } catch (error) {
      showJobApplyErrorToast(
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  const isSubmitting = submitMutation.isPending || uploadMutation.isPending;
  const resume = applyContext?.resume ?? null;
  const canSubmit = Boolean(resume) && Boolean(coverText.trim()) && !isSubmitting;

  if (step === "success") {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Application Submitted!"
        maxWidthClassName="max-w-lg"
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <p className="mb-6 leading-relaxed text-gray-500">
            Your application for{" "}
            <span className="font-semibold text-gray-700">{job.title}</span> at{" "}
            <span className="font-semibold text-gray-700">{job.company}</span>{" "}
            has been sent to {job.recruiter.name}.
          </p>

          <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-5 text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              What happens next
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              {job.recruiter.name} at {job.recruiter.company} has been notified.
              Your Vodora profile, resume, and cover letter have been shared. You
              can track this application from the job board.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Apply for ${job.title}`}
      description={`${job.company} · ${job.location}`}
      maxWidthClassName="max-w-2xl"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={!canSubmit || isContextPending || isContextError}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit Application
          </button>
        </div>
      }
    >
      {isContextPending ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
          Loading your profile details…
        </div>
      ) : isContextError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="mb-2 flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            Could not load your application details
          </div>
          <p className="mb-4">
            {contextError instanceof Error
              ? contextError.message
              : "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => void refetchContext()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : applyContext?.alreadyApplied ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle className="h-4 w-4" />
            You have already applied for this role.
          </div>
        </div>
      ) : (
        <div className="space-y-7">
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Your Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "Full Name", value: applyContext?.fullName ?? "" },
                { label: "Email", value: applyContext?.email ?? "" },
                { label: "Phone", value: applyContext?.phone ?? "" },
                { label: "Location", value: applyContext?.location ?? "" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    {label}
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
                    <span className="text-sm text-gray-900">{value}</span>
                    <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-gray-100" />

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Resume
            </h3>
            {resume ? (
              <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {resume.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {resume.mimeType?.includes("pdf") ? "PDF" : "Document"} ·{" "}
                    {formatFileSize(resume.fileSizeBytes)} · Uploaded{" "}
                    {formatUploadedDate(resume.uploadedAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                No resume found on your profile. Upload one from{" "}
                <a href="/my-profile/edit" className="font-medium underline">
                  My Profile
                </a>{" "}
                before applying.
              </div>
            )}
          </section>

          <div className="border-t border-gray-100" />

          <section>
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Cover Letter
            </h3>
            <p className="mb-4 text-xs text-gray-400">
              Write one below or attach a file. Your latest cover letter is saved
              to your profile for next time.
            </p>
            <textarea
              rows={7}
              value={coverText}
              onChange={(event) => setCoverText(event.target.value)}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-gray-400">Or attach a file:</span>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700">
                <Upload className="h-3.5 w-3.5" />
                {coverFileName || pendingCoverFile?.name || "Upload cover letter"}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      setPendingCoverFile(file);
                      setCoverFileName(file.name);
                      setCoverLetterDocumentId(null);
                    }
                  }}
                />
              </label>
              {coverFileName || pendingCoverFile ? (
                <button
                  type="button"
                  onClick={() => {
                    setCoverFileName("");
                    setPendingCoverFile(null);
                    setCoverLetterDocumentId(
                      applyContext?.coverLetterDocument?.id ?? null,
                    );
                  }}
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </Modal>
  );
}
