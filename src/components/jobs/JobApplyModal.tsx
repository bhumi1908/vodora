"use client";

import {
  CheckCircle,
  FileText,
  Send,
  Shield,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import type { CandidateJob } from "@/lib/jobs/candidate-jobs.types";

type JobApplyModalProps = {
  job: CandidateJob;
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
};

export function JobApplyModal({
  job,
  open,
  onClose,
  onApplied,
}: JobApplyModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [resumeFile, setResumeFile] = useState(
    "Sarah_Johnson_Resume_2026.pdf",
  );
  const [coverFile, setCoverFile] = useState("");
  const [coverText, setCoverText] = useState(
    `Dear ${job.recruiter.name},\n\nI am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background and verified references on Vodora, I am confident I would be a valuable addition to your team.\n\nI look forward to discussing this opportunity further.\n\nKind regards,\nSarah Johnson`,
  );
  const [refsAttached, setRefsAttached] = useState(true);

  const handleClose = () => {
    setStep("form");
    onClose();
  };

  const handleApply = () => {
    setStep("success");
    onApplied();
  };

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
              Confirmation Email Sent To You
            </p>
            <div className="mb-3 space-y-1 border-b border-gray-200 pb-3 text-sm text-gray-600">
              <p>
                To:{" "}
                <span className="text-gray-900">sarah.johnson@email.com</span>
              </p>
              <p>
                Subject:{" "}
                <span className="text-gray-900">
                  Application Confirmed — {job.title} at {job.company}
                </span>
              </p>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">
              Hi Sarah, your application has been received by {job.recruiter.name}{" "}
              at {job.recruiter.company}. Your Vodora verified profile, resume
              {refsAttached ? ", references," : ""} and cover letter have been
              shared. You can track your application status in your{" "}
              <strong>Jobs</strong> tab.
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
            className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!resumeFile}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Submit Application
          </button>
        </div>
      }
    >
      <div className="space-y-7">
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
            Your Details
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "Full Name", value: "Sarah Johnson" },
              { label: "Email", value: "sarah.johnson@email.com" },
              { label: "Phone", value: "+1 (555) 123-4567" },
              { label: "Location", value: "San Francisco, CA" },
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
          {resumeFile ? (
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{resumeFile}</p>
                <p className="text-xs text-gray-500">
                  PDF · 1.4 MB · Uploaded 12 May 2026
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResumeFile("")}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Remove resume"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-400">
              <Upload className="h-7 w-7 text-gray-400" />
              <span className="text-sm text-gray-600">
                Drop your resume here or{" "}
                <span className="font-medium text-blue-600">browse</span>
              </span>
              <span className="text-xs text-gray-400">PDF, DOCX up to 10 MB</span>
              <input
                type="file"
                className="hidden"
                onChange={(event) =>
                  event.target.files?.[0] &&
                  setResumeFile(event.target.files[0].name)
                }
              />
            </label>
          )}
        </section>

        <div className="border-t border-gray-100" />

        <section>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">
            Cover Letter
          </h3>
          <p className="mb-4 text-xs text-gray-400">
            Write one below or attach a file
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
              {coverFile || "Upload cover letter"}
              <input
                type="file"
                className="hidden"
                onChange={(event) =>
                  event.target.files?.[0] &&
                  setCoverFile(event.target.files[0].name)
                }
              />
            </label>
            {coverFile ? (
              <button type="button" onClick={() => setCoverFile("")}>
                <X className="h-3 w-3 text-gray-400" />
              </button>
            ) : null}
          </div>
        </section>

        <div className="border-t border-gray-100" />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Verified References
              </h3>
              <p className="mt-0.5 text-xs text-gray-400">From your Vodora profile</p>
            </div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={refsAttached}
                onChange={(event) => setRefsAttached(event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Attach to application</span>
            </label>
          </div>
          {refsAttached ? (
            <div className="space-y-2">
              {[
                {
                  name: "John Smith",
                  title: "Engineering Manager, Tech Corp",
                  type: "Direct Manager",
                },
                {
                  name: "Lisa Anderson",
                  title: "CTO, StartupXYZ",
                  type: "Former Supervisor",
                },
              ].map((reference) => (
                <div
                  key={reference.name}
                  className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {reference.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reference.title} · {reference.type}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </Modal>
  );
}
