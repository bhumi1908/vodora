"use client";

import {
  Briefcase,
  CheckCircle,
  Lock,
  Shield,
} from "lucide-react";
import Link from "next/link";

import type { ReferenceResponseFormData } from "@/components/profile/reference/types";
import {
  formatReferenceId,
  referenceBadgeClass,
} from "@/lib/references/reference-respond-badge";
import type { ReferenceInvitationDetails } from "@/lib/references/fetch-reference-invitation";
import {
  formatWrittenAssessmentAnswerValue,
  getWrittenAssessmentQuestion,
  WRITTEN_REFERENCE_SUMMARY_FIELDS,
} from "@/lib/references/written-reference-assessment";

type ReferenceRespondSuccessProps = {
  responseId: string;
  form: ReferenceResponseFormData;
  invitation: ReferenceInvitationDetails;
  status: "verified" | "submitted";
  welcomeRedirectTo?: string;
};

export function ReferenceRespondSuccess({
  responseId,
  form,
  invitation,
  status,
  welcomeRedirectTo,
}: ReferenceRespondSuccessProps) {
  const summary = WRITTEN_REFERENCE_SUMMARY_FIELDS.map(({ id, label }) => {
    const question = getWrittenAssessmentQuestion(id);
    const rawValue = form.writtenAssessmentAnswers[id] ?? "";
    const value = question
      ? formatWrittenAssessmentAnswerValue(question, rawValue)
      : rawValue;

    return { label, value };
  }).filter(
    (entry) =>
      entry.value && entry.value !== "Unable to Assess" && entry.value !== "",
  );

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const refId = formatReferenceId(responseId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
          Reference Submitted Successfully
        </h1>
        <p className="text-sm text-gray-500 sm:text-base">
          Thank you for verifying {invitation.candidateName}. Your reference has
          been securely recorded.
        </p>
        {status === "submitted" ? (
          <p className="mt-2 text-xs text-amber-700">
            Your reference is awaiting admin verification before it appears on the
            candidate&apos;s profile.
          </p>
        ) : null}
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-semibold text-gray-900">This reference has been:</h2>
        <div className="space-y-3">
          {[
            { icon: CheckCircle, text: "Time stamped", detail: timeStr },
            { icon: CheckCircle, text: "Date stamped", detail: dateStr },
            { icon: Lock, text: "Locked from editing", detail: "Immutable record" },
            {
              icon: Shield,
              text: "Attached to the candidate's Vodora Trust Profile",
              detail: invitation.candidateName,
            },
          ].map(({ icon: Icon, text, detail }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-green-600" />
              <span className="flex-1 text-sm text-gray-700">{text}</span>
              <span className="text-xs text-gray-400">{detail}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-0.5 text-xs text-gray-400">Reference ID</p>
            <p className="font-mono text-sm font-semibold text-blue-700">{refId}</p>
          </div>
          <div className="sm:text-right">
            <p className="mb-0.5 text-xs text-gray-400">Verified by</p>
            <p className="text-sm font-medium text-gray-700">
              {form.signatureName} · {invitation.refereeCompany}
            </p>
          </div>
        </div>
      </div>

      {summary.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Referee Summary</h2>
            <span className="text-xs text-gray-400">— Visible to recruiters</span>
          </div>
          <p className="mb-4 text-xs text-gray-400">
            This structured snapshot helps recruiters quickly assess the candidate
            without reading the full reference.
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {summary.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5"
              >
                <span className="text-xs font-medium text-gray-600">{label}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${referenceBadgeClass(value)}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {welcomeRedirectTo ? (
        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white px-5 py-6 text-center sm:px-6">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded bg-blue-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Welcome to Vodora!
            </h2>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Let&apos;s complete your professional profile
            </p>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <p className="text-sm text-gray-600">
              You&apos;ve permitted Vodora to create a professional profile for you.
              Your name, title, and company will be pre-populated — complete your
              setup in less than 2 minutes.
            </p>
            <Link
              href={welcomeRedirectTo}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Complete Your Profile
            </Link>
          </div>
        </div>
      ) : null}

      <p className="text-center text-xs text-gray-400">
        Questions? Contact{" "}
        <span className="text-blue-600">support@vodora.com</span>
      </p>
    </div>
  );
}
