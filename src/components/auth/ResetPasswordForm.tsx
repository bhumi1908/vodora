"use client";

import { Lock } from "lucide-react";
import { FormEvent, useState } from "react";

import { AuthInput } from "@/components/auth/shared/AuthInput";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import type {
  ChangePasswordApiResponse,
  ResetPasswordApiResponse,
} from "@/lib/auth/types";
import { getResetPasswordFieldErrors } from "@/lib/auth/validation";
import { hasFieldErrors } from "@/lib/form/field-errors";

type ResetPasswordFormProps = {
  mode: "token" | "session";
  token?: string;
  onSuccess?: () => void;
  showHeading?: boolean;
};

export function ResetPasswordForm({
  mode,
  token,
  onSuccess,
  showHeading = true,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { errors, setErrors, clearField } = useFieldErrors<
    "password" | "confirmPassword"
  >();
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const fieldErrors = getResetPasswordFieldErrors({
      password,
      confirmPassword,
    });

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    if (mode === "token" && !token) {
      setFormError("This reset link is invalid or has expired.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const endpoint =
        mode === "token"
          ? "/api/auth/reset-password"
          : "/api/auth/change-password";

      const body =
        mode === "token"
          ? { token, password, confirmPassword }
          : { password, confirmPassword };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = (await response.json()) as
        | ResetPasswordApiResponse
        | ChangePasswordApiResponse;

      if (!response.ok || !result.success) {
        setFormError(result.error ?? "Unable to update password.");
        return;
      }

      setIsSuccess(true);
      onSuccess?.();

      if (mode === "token" && "redirectTo" in result && result.redirectTo) {
        window.setTimeout(() => {
          window.location.href = result.redirectTo!;
        }, 1500);
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        {mode === "token"
          ? "Password updated successfully. Redirecting to login..."
          : "Password updated successfully."}
      </div>
    );
  }

  return (
    <div>
      {showHeading ? (
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-semibold text-gray-900">
            {mode === "token" ? "Set a new password" : "Reset password"}
          </h1>
          <p className="text-gray-600">
            {mode === "token"
              ? "Choose a new password for your Vodora account."
              : "Enter a new password for your account."}
          </p>
        </div>
      ) : null}

      {formError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthInput
          id="password"
          label="New Password"
          type="password"
          required
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearField("password");
            setFormError("");
          }}
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          hint="Must be at least 8 characters."
          error={errors.password}
        />

        <AuthInput
          id="confirmPassword"
          label="Confirm New Password"
          type="password"
          required
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            clearField("confirmPassword");
            setFormError("");
          }}
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
