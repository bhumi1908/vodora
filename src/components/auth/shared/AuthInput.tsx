import type { ChangeEvent, ReactNode } from "react";

import { FieldError } from "@/components/auth/shared/FormFields";

interface AuthInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon: ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
}

export function AuthInput({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  required = false,
  hint,
  error,
}: AuthInputProps) {
  const inputClassName = error
    ? "w-full rounded-lg border border-red-500 py-3 pl-10 pr-4 text-base outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-red-500 sm:text-sm"
    : "w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-base outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:text-sm";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className={inputClassName}
        />
      </div>
      {hint && !error ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  );
}
