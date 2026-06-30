"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ChangeEvent, type ReactNode } from "react";

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
  showPasswordToggle?: boolean;
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
  showPasswordToggle = false,
}: AuthInputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const canTogglePassword = showPasswordToggle && type === "password";
  const inputType = canTogglePassword
    ? passwordVisible
      ? "text"
      : "password"
    : type;

  const inputClassName = error
    ? `w-full rounded-lg border border-red-500 py-3 pl-10 text-base outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-red-500 sm:text-sm ${canTogglePassword ? "pr-10" : "pr-4"}`
    : `w-full rounded-lg border border-gray-300 py-3 pl-10 text-base outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:text-sm ${canTogglePassword ? "pr-10" : "pr-4"}`;

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
          type={inputType}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className={inputClassName}
        />
        {canTogglePassword ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((current) => !current)}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
          >
            {passwordVisible ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
      {hint && !error ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  );
}
