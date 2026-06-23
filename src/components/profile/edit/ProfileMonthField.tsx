"use client";

import type { ChangeEvent } from "react";

import { FieldError } from "@/components/auth/shared/FormFields";
import { getMaxMonthInput } from "@/lib/profile/validation";

const fieldClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm";

function getFieldClassName(error?: string) {
  if (error) {
    return `${fieldClassName} border-red-500 focus:ring-red-500`;
  }

  return fieldClassName;
}

type ProfileMonthFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  hint?: string;
  error?: string;
};

export function ProfileMonthField({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  min,
  max,
  hint,
  error,
}: ProfileMonthFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={id}
        type="month"
        required={required}
        disabled={disabled}
        value={value}
        min={min}
        max={max ?? getMaxMonthInput()}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        className={getFieldClassName(error)}
      />
      {hint && !error ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  );
}
