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
import { parseTextList } from "@/lib/jobs/format-job-posting";
import { JOB_POSTING_CATEGORIES } from "@/lib/jobs/job-board-options";
import { showJobCreatedSuccessToast } from "@/lib/jobs/job-toast";
import {
  getCreateJobPostingFieldErrors,
  hasCreateJobPostingErrors,
} from "@/lib/jobs/job-validation";
import type {
  CreateJobPostingFieldErrors,
  CreateJobPostingPayload,
  WorkTypeOption,
} from "@/lib/jobs/recruiter-jobs.types";
import { useCreateRecruiterJobMutation } from "@/lib/query/use-job-queries";

type RecruiterCreateJobModalProps = {
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

export function RecruiterCreateJobModal({
  open,
  onClose,
  defaultCompanyName,
  workTypes,
}: RecruiterCreateJobModalProps) {
  const createMutation = useCreateRecruiterJobMutation();
  const [form, setForm] = useState<CreateJobPostingPayload>(EMPTY_FORM);
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CreateJobPostingFieldErrors>(
    {},
  );
  const [error, setError] = useState("");

  const initialForm = useMemo(
    () => ({
      ...EMPTY_FORM,
      companyDisplayName: defaultCompanyName,
      workTypeId: workTypes[0]?.id ?? "",
    }),
    [defaultCompanyName, workTypes],
  );

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setResponsibilitiesText("");
      setRequirementsText("");
      setFieldErrors({});
      setError("");
    }
  }, [open, initialForm]);

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

    const payload: CreateJobPostingPayload = {
      ...form,
      companyDisplayName: form.companyDisplayName || defaultCompanyName,
      responsibilities: parseTextList(responsibilitiesText),
      requirements: parseTextList(requirementsText),
      publish: true,
    };

    const errors = getCreateJobPostingFieldErrors(payload);

    if (hasCreateJobPostingErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError("");

    try {
      const result = await createMutation.mutateAsync(payload);

      if (!result.success) {
        setError(result.error ?? "Could not create job posting.");
        return;
      }

      showJobCreatedSuccessToast();
      handleClose();
    } catch {
      setError("Could not create job posting.");
    }
  }

  const categoryOptions = JOB_POSTING_CATEGORIES.map((category) => ({
    value: category,
    label: category,
  }));

  const workTypeOptions = workTypes.map((workType) => ({
    value: workType.id,
    label: workType.name,
  }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Post New Role"
      description="Create a job posting for candidates to discover and apply."
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
            form="create-job-form"
            disabled={createMutation.isPending || workTypeOptions.length === 0}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {createMutation.isPending ? "Publishing…" : "Publish Role"}
          </button>
        </div>
      }
    >
      <form id="create-job-form" onSubmit={handleSubmit} className="space-y-5">
        <FormField
          id="job-title"
          label="Job title"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="e.g. Senior Software Engineer"
          required
          error={fieldErrors.title}
        />

        <AuthFormGrid>
          <FormField
            id="job-company"
            label="Company"
            value={form.companyDisplayName || defaultCompanyName}
            onChange={(event) =>
              updateField("companyDisplayName", event.target.value)
            }
            required
            error={fieldErrors.companyDisplayName}
          />

          <FormSelect
            id="job-category"
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
            id="job-location"
            label="Location"
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="e.g. Sydney / Remote"
            required
            error={fieldErrors.location}
          />

          <FormSelect
            id="job-work-type"
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
          id="job-salary"
          label="Salary"
          value={form.salaryDisplay}
          onChange={(event) => updateField("salaryDisplay", event.target.value)}
          placeholder="e.g. $150k–$180k or $900/day"
        />

        <FormTextarea
          id="job-description"
          label="Description"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Describe the role and what makes it a great opportunity…"
          required
          error={fieldErrors.description}
        />

        <FormTextarea
          id="job-responsibilities"
          label="Responsibilities"
          value={responsibilitiesText}
          onChange={(event) => setResponsibilitiesText(event.target.value)}
          placeholder="One responsibility per line"
        />

        <FormTextarea
          id="job-requirements"
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

        {error ? <FormError message={error} /> : null}
      </form>
    </Modal>
  );
}
