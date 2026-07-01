import type { ChangeEvent, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

import {
  SELECT_RIGHT_PADDING_CLASSNAME,
  SelectField,
} from "@/components/shared/SelectField";

const fieldClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:text-sm";

const selectFieldClassName = `w-full appearance-none rounded-lg border border-gray-300 py-3 pl-4 ${SELECT_RIGHT_PADDING_CLASSNAME} text-base outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:text-sm`;

function getFieldClassName(error?: string) {
  if (error) {
    return `${fieldClassName} border-red-500 focus:ring-red-500`;
  }

  return fieldClassName;
}

export function getSelectFieldClassName(error?: string) {
  if (error) {
    return `${selectFieldClassName} border-red-500 focus:ring-red-500`;
  }

  return selectFieldClassName;
}

interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return <p className="mt-1.5 text-sm text-red-600">{message}</p>;
}

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
}

export function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  hint,
  error,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={getFieldClassName(error)}
      />
      {hint && !error ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  );
}

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: FormSelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  required = false,
  disabled = false,
  error,
}: FormSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
        {label}
        {required ? " *" : ""}
      </label>
      <SelectField>
        <select
          id={id}
          required={required}
          disabled={disabled}
          value={value}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          className={`${getSelectFieldClassName(error)}${disabled ? " cursor-not-allowed bg-gray-50 text-gray-500" : ""}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </SelectField>
      <FieldError message={error} />
    </div>
  );
}

interface FormRadioGroupProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  required?: boolean;
  error?: string;
}

export function FormRadioGroup({
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  error,
}: FormRadioGroupProps) {
  return (
    <div>
      <p className="mb-3 block text-sm font-medium text-gray-700">
        {label}
        {required ? " *" : ""}
      </p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors hover:border-blue-500 has-[:checked]:border-blue-500 ${
              error ? "border-red-300" : "border-gray-200"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              required={required && index === 0 && !value}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

interface FormCheckboxGridProps {
  label: string;
  options: FormSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  error?: string;
}

export function FormCheckboxGrid({
  label,
  options,
  value,
  onChange,
  required = false,
  error,
}: FormCheckboxGridProps) {
  function toggleOption(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  return (
    <div>
      <p className="mb-3 block text-sm font-medium text-gray-700">
        {label}
        {required ? " *" : ""}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-3 transition-colors hover:border-blue-500 has-[:checked]:border-blue-500"
          >
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              onChange={() => toggleOption(option.value)}
              className="h-4 w-4 rounded text-blue-600"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  error?: string;
}

export function FormTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  error,
}: FormTextareaProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
        {label}
        {required ? " *" : ""}
      </label>
      <textarea
        id={id}
        required={required}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={`${getFieldClassName(error)} resize-none`}
      />
      <FieldError message={error} />
    </div>
  );
}

interface ImportActionButtonProps {
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

export function ImportActionButton({
  icon,
  children,
  onClick,
}: ImportActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:border-gray-400"
    >
      {icon}
      {children}
    </button>
  );
}

interface TermsAgreementProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
}

export function TermsAgreement({
  checked,
  onChange,
  required = true,
  error,
}: TermsAgreementProps) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          aria-invalid={error ? true : undefined}
          className="mt-0.5 h-4 w-4 rounded text-blue-600"
        />
        <span className="text-sm text-gray-600">
          I agree to the{" "}
          <Link
            href="/terms-and-conditions"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Link>
        </span>
      </label>
      <FieldError message={error} />
    </div>
  );
}

interface FormSectionProps {
  title: string;
  optional?: boolean;
  children: ReactNode;
}

export function FormSection({ title, optional = false, children }: FormSectionProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">
        {title}
        {optional ? (
          <span className="font-normal text-gray-500"> (Optional)</span>
        ) : null}
      </p>
      {children}
    </div>
  );
}

interface InfoAlertProps {
  title: string;
  children: ReactNode;
  variant?: "info" | "success";
}

export function InfoAlert({ title, children, variant = "info" }: InfoAlertProps) {
  const styles =
    variant === "info"
      ? "bg-blue-50 border-blue-200 text-blue-900"
      : "bg-green-50 border-green-200 text-green-900";

  const iconColor = variant === "info" ? "text-blue-600" : "text-green-600";

  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${styles}`}>
      <AlertCircle className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
      <div className="text-sm">
        <p className="mb-1 font-medium">{title}</p>
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

interface AuthFormGridProps {
  children: ReactNode;
}

export function AuthFormGrid({ children }: AuthFormGridProps) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

interface AuthSubmitButtonProps {
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export function AuthSubmitButton({
  children,
  disabled = false,
  loading = false,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Creating account..." : children}
    </button>
  );
}

interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

interface FormSuccessProps {
  title: string;
  message: string;
}

export function FormSuccess({ title, message }: FormSuccessProps) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
      <p className="font-medium">{title}</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
