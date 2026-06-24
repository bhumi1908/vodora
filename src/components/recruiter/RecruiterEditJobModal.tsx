"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AuthFormGrid,
  FormError,
  FormField,
  FormSelect,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { parseTextList } from "@/lib/jobs/format-job-posting";
import { JOB_POSTING_CATEGORIES } from "@/lib/jobs/job-board-options";
import { showJobUpdatedSuccessToast } from "@/lib/jobs/job-toast";
import {
  getCreateJobPostingFieldErrors,
  hasCreateJobPostingErrors,
} from "@/lib/jobs/job-validation";
import type {
  CreateJobPostingFieldErrors,
  CreateJobPostingPayload,
  WorkTypeOption,
} from "@/lib/jobs/recruiter-jobs.types";
import {
  useRecruiterJobDetailQuery,
  useUpdateRecruiterJobMutation,
} from "@/lib/query/use-job-queries";

type RecruiterEditJobModalProps = {
  jobId: string | null;
  open: boolean;
  onClose: () => void;
  defaultCompanyName: string;
  workTypes: WorkTypeOption[];
};

const EMPTY_FORM: CreateJobPostingPayload = {
  title: "",
  companyDisplayName: "",
  category: JOB_POSTING_CATEGORIES[0],
  location: "",
  workTypeId: "",
  salaryDisplay: "",
  description: "",
  responsibilities: [],
  requirements: [],
  isUrgent: false,
  publish: true,
};

function EditJobFormSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  );
}

export function RecruiterEditJobModal({
  jobId,
  open,
  onClose,
  defaultCompanyName,
  workTypes,
}: RecruiterEditJobModalProps) {
  const {
    data: jobDetail,
    isPending: isJobLoading,
    isError: isJobError,
    error: jobError,
  } = useRecruiterJobDetailQuery(jobId, open);
  const updateMutation = useUpdateRecruiterJobMutation(jobId ?? "");
  const [form, setForm] = useState<CreateJobPostingPayload>(EMPTY_FORM);
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CreateJobPostingFieldErrors>(
    {},
  );
  const [error, setError] = useState("");

  const workTypeOptions = useMemo(
    () =>
      workTypes.map((workType) => ({
        value: workType.id,
        label: workType.name,
      })),
    [workTypes],
  );

  const categoryOptions = useMemo(
    () =>
      JOB_POSTING_CATEGORIES.map((category) => ({
        value: category,
        label: category,
      })),
    [],
  );

  useEffect(() => {
    if (!open || !jobDetail) {
      return;
    }

    setForm({
      title: jobDetail.title,
      companyDisplayName: jobDetail.companyDisplayName || defaultCompanyName,
      category: jobDetail.category,
      location: jobDetail.location,
      workTypeId: jobDetail.workTypeId,
      salaryDisplay: jobDetail.salaryDisplay,
      description: jobDetail.description,
      responsibilities: jobDetail.responsibilities,
      requirements: jobDetail.requirements,
      isUrgent: jobDetail.isUrgent,
      publish: jobDetail.status === "published",
    });
    setResponsibilitiesText(jobDetail.responsibilities.join("\n"));
    setRequirementsText(jobDetail.requirements.join("\n"));
    setFieldErrors({});
    setError("");
  }, [open, jobDetail, defaultCompanyName]);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setResponsibilitiesText("");
      setRequirementsText("");
      setFieldErrors({});
      setError("");
    }
  }, [open]);

  function handleClose() {
    onClose();
  }

  function updateField<K extends keyof CreateJobPostingPayload>(
    field: K,
    value: CreateJobPostingPayload[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!jobId) {
      return;
    }

    const payload: CreateJobPostingPayload = {
      ...form,
      companyDisplayName: form.companyDisplayName || defaultCompanyName,
      responsibilities: parseTextList(responsibilitiesText),
      requirements: parseTextList(requirementsText),
    };

    const errors = getCreateJobPostingFieldErrors(payload);

    if (hasCreateJobPostingErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError("");

    try {
      const result = await updateMutation.mutateAsync(payload);

      if (!result.success) {
        setError(result.error ?? "Could not update job posting.");
        return;
      }

      showJobUpdatedSuccessToast();
      handleClose();
    } catch {
      setError("Could not update job posting.");
    }
  }

  const isFormReady = Boolean(jobDetail) && !isJobLoading && !isJobError;
  const loadError =
    jobError instanceof Error ? jobError.message : "Could not load job posting.";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Role"
      description="Update your job posting details."
      maxWidthClassName="max-w-2xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-job-form"
            disabled={
              !isFormReady ||
              updateMutation.isPending ||
              workTypeOptions.length === 0
            }
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      }
    >
      {isJobLoading ? <EditJobFormSkeleton /> : null}

      {isJobError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      {isFormReady ? (
        <form id="edit-job-form" onSubmit={handleSubmit} className="space-y-5">
          <FormField
            id="edit-job-title"
            label="Job title"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="e.g. Senior Software Engineer"
            required
            error={fieldErrors.title}
          />

          <AuthFormGrid>
            <FormField
              id="edit-job-company"
              label="Company"
              value={form.companyDisplayName || defaultCompanyName}
              onChange={(event) =>
                updateField("companyDisplayName", event.target.value)
              }
              required
              error={fieldErrors.companyDisplayName}
            />

            <FormSelect
              id="edit-job-category"
              label="Category"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              options={categoryOptions}
              required
              error={fieldErrors.category}
            />
          </AuthFormGrid>

          <AuthFormGrid>
            <FormField
              id="edit-job-location"
              label="Location"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="e.g. Sydney / Remote"
              required
              error={fieldErrors.location}
            />

            <FormSelect
              id="edit-job-work-type"
              label="Work type"
              value={form.workTypeId || workTypes[0]?.id || ""}
              onChange={(event) => updateField("workTypeId", event.target.value)}
              options={workTypeOptions}
              placeholder="Select work type"
              required
              error={fieldErrors.workTypeId}
            />
          </AuthFormGrid>

          <FormField
            id="edit-job-salary"
            label="Salary"
            value={form.salaryDisplay}
            onChange={(event) => updateField("salaryDisplay", event.target.value)}
            placeholder="e.g. $150k–$180k or $900/day"
          />

          <FormTextarea
            id="edit-job-description"
            label="Description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Describe the role and what makes it a great opportunity…"
            required
            error={fieldErrors.description}
          />

          <FormTextarea
            id="edit-job-responsibilities"
            label="Responsibilities"
            value={responsibilitiesText}
            onChange={(event) => setResponsibilitiesText(event.target.value)}
            placeholder="One responsibility per line"
          />

          <FormTextarea
            id="edit-job-requirements"
            label="Requirements"
            value={requirementsText}
            onChange={(event) => setRequirementsText(event.target.value)}
            placeholder="One requirement per line"
          />

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isUrgent}
              onChange={(event) => updateField("isUrgent", event.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mark as urgent</span>
          </label>

          {jobDetail.status === "draft" ? (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.publish}
                onChange={(event) => updateField("publish", event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Publish this role</span>
            </label>
          ) : null}

          {error ? <FormError message={error} /> : null}
        </form>
      ) : null}
    </Modal>
  );
}
