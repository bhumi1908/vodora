"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import { FieldError } from "@/components/auth/shared/FormFields";
import type { JobTitleOptionGroup } from "@/lib/job-titles/types";

const fieldClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:text-sm";

function getFieldClassName(error?: string) {
  if (error) {
    return `${fieldClassName} border-red-500 focus:ring-red-500`;
  }

  return fieldClassName;
}

function hasOptionGroups(optionGroups?: JobTitleOptionGroup[]): boolean {
  return Boolean(optionGroups && optionGroups.length > 0);
}

type JobTitleSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  optionGroups?: JobTitleOptionGroup[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
};

type JobTitlesApiResponse = {
  success: boolean;
  optionGroups?: JobTitleOptionGroup[];
  error?: string;
};

export function JobTitleSelect({
  id,
  label,
  value,
  onChange,
  optionGroups: initialOptionGroups,
  placeholder = "Select your job title",
  required = false,
  error,
  disabled = false,
}: JobTitleSelectProps) {
  const [optionGroups, setOptionGroups] = useState<JobTitleOptionGroup[]>(
    hasOptionGroups(initialOptionGroups) ? initialOptionGroups! : [],
  );
  const [isLoading, setIsLoading] = useState(!hasOptionGroups(initialOptionGroups));
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (hasOptionGroups(initialOptionGroups)) {
      setOptionGroups(initialOptionGroups!);
      setIsLoading(false);
      setLoadError("");
      return;
    }

    let cancelled = false;

    async function loadOptionGroups() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch("/api/job-titles");
        const result = (await response.json()) as JobTitlesApiResponse;

        if (cancelled) {
          return;
        }

        if (!response.ok || !result.success || !result.optionGroups?.length) {
          setOptionGroups([]);
          setLoadError(
            result.error ??
              "Unable to load job titles. Please refresh the page.",
          );
          return;
        }

        setOptionGroups(result.optionGroups);
        setLoadError("");
      } catch {
        if (!cancelled) {
          setOptionGroups([]);
          setLoadError("Unable to load job titles. Please refresh the page.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadOptionGroups();

    return () => {
      cancelled = true;
    };
  }, [initialOptionGroups]);

  const displayError = error ?? loadError;
  const selectPlaceholder = isLoading ? "Loading job titles..." : placeholder;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
        {label}
        {required ? " *" : ""}
      </label>
      <select
        id={id}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled || isLoading}
        aria-invalid={displayError ? true : undefined}
        aria-busy={isLoading}
        className={getFieldClassName(displayError)}
      >
        <option value="">{selectPlaceholder}</option>
        {optionGroups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <FieldError message={displayError} />
    </div>
  );
}
