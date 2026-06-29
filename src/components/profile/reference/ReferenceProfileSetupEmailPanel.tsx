"use client";

import { Mail } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const RESEND_COOLDOWN_SECONDS = 60;

type ReferenceProfileSetupEmailPanelProps = {
  email: string;
  recipientName: string;
};

async function sendProfileSetupLink(
  email: string,
): Promise<{ ok: true } | { ok: false; error?: string }> {
  try {
    const response = await fetch("/api/auth/send-invited-setup-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = (await response.json()) as {
      success: boolean;
      error?: string;
    };

    if (response.ok && result.success) {
      return { ok: true };
    }

    return { ok: false, error: result.error };
  } catch {
    return { ok: false, error: "Unable to send setup email. Please try again." };
  }
}

export function ReferenceProfileSetupEmailPanel({
  email,
  recipientName,
}: ReferenceProfileSetupEmailPanelProps) {
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    "Setup email sent. Please check your inbox.",
  );
  const [cooldownSeconds, setCooldownSeconds] = useState(RESEND_COOLDOWN_SECONDS);

  const startCooldown = useCallback((seconds: number) => {
    setCooldownSeconds(seconds);
  }, []);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setCooldownSeconds((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [cooldownSeconds]);

  async function handleResend() {
    if (cooldownSeconds > 0) {
      return;
    }

    setFormError("");
    setSuccessMessage("Setup email sent. Please check your inbox.");
    startCooldown(RESEND_COOLDOWN_SECONDS);

    const result = await sendProfileSetupLink(email);

    if (!result.ok) {
      setSuccessMessage("");
      setFormError(result.error ?? "Unable to send setup email. Please try again.");
    }
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white px-5 py-6 text-center sm:px-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Check your email</h2>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          We sent you a link to create your Vodora profile
        </p>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <p className="text-sm text-gray-600">
          Hi {recipientName}, we&apos;ve sent account setup instructions to{" "}
          <strong className="text-gray-900">{email}</strong>. Your name, title, and
          company are already pre-populated — use the link in that email to set your
          password and complete your profile.
        </p>

        {formError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMessage}
          </div>
        ) : null}

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            Didn&apos;t receive the email? Check your spam folder or resend the
            setup link below.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={cooldownSeconds > 0}
          className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cooldownSeconds > 0
            ? `Resend in ${cooldownSeconds}s`
            : "Resend Setup Email"}
        </button>
      </div>
    </div>
  );
}
