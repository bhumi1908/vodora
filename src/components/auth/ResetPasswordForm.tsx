"use client";

import { Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthInput } from "@/components/auth/shared/AuthInput";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { showPasswordUpdatedSuccessToast } from "@/lib/auth-toast";
import { generateSecurePassword } from "@/lib/auth/generate-password";
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
  redirectOnSuccess?: boolean;
  showGeneratePassword?: boolean;
  compact?: boolean;
};

export function ResetPasswordForm({
  mode,
  token,
  onSuccess,
  showHeading = true,
  redirectOnSuccess = true,
  showGeneratePassword = false,
  compact = false,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { errors, setErrors, clearField } = useFieldErrors<
    "password" | "confirmPassword"
  >();
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleGeneratePassword() {
    const generatedPassword = generateSecurePassword();
    setPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    clearField("password");
    clearField("confirmPassword");
    setFormError("");
  }

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

      showPasswordUpdatedSuccessToast();
      onSuccess?.();

      if (
        redirectOnSuccess &&
        "redirectTo" in result &&
        result.redirectTo
      ) {
        router.push(result.redirectTo);
        router.refresh();
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

      {showGeneratePassword ? (
        <div className="mb-1 flex justify-end">
          <button
            type="button"
            onClick={handleGeneratePassword}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate password
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className={compact ? "grid gap-5 sm:grid-cols-2" : "space-y-5"}>
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
            showPasswordToggle
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
            showPasswordToggle
          />
        </div>

        <div className={compact ? "flex justify-end" : ""}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={
              compact
                ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                : "w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            }
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
