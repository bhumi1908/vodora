"use client";

import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  FileText,
  Send,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

type CollectReferenceTabProps = {
  recruiterName: string;
  companyName: string | null;
};

type CollectReferenceForm = {
  candidateName: string;
  candidateTitle: string;
  candidateCompany: string;
  candidateEmail: string;
  refereeName: string;
  refereeTitle: string;
  refereeCompany: string;
  refereeEmail: string;
  refereePhone: string;
  relationship: string;
  jobTitle: string;
  employmentStart: string;
  employmentEnd: string;
  notes: string;
};

const emptyForm = (): CollectReferenceForm => ({
  candidateName: "",
  candidateTitle: "",
  candidateCompany: "",
  candidateEmail: "",
  refereeName: "",
  refereeTitle: "",
  refereeCompany: "",
  refereeEmail: "",
  refereePhone: "",
  relationship: "",
  jobTitle: "",
  employmentStart: "",
  employmentEnd: "",
  notes: "",
});

export function CollectReferenceTab({
  recruiterName,
  companyName,
}: CollectReferenceTabProps) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const update = (field: keyof CollectReferenceForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isValid =
    form.candidateName &&
    form.candidateEmail &&
    form.refereeName &&
    form.refereeEmail &&
    form.relationship;

  const handleSend = () => {
    if (!isValid) {
      return;
    }

    setSent(true);
  };

  const reset = () => {
    setSent(false);
    setForm(emptyForm());
  };

  const companyLabel = companyName ?? "your company";

  if (sent) {
    return (
      <div className="mx-auto max-w-2xl py-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="mb-2 text-2xl font-semibold text-gray-900">
          Reference Request Sent
        </h3>
        <p className="mb-8 leading-relaxed text-gray-500">
          Two emails have been dispatched:
        </p>

        <div className="mb-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                Email to Referee
              </span>
            </div>
            <p className="text-sm font-medium text-blue-800">{form.refereeName}</p>
            <p className="mb-3 text-xs text-blue-600">{form.refereeEmail}</p>
            <p className="text-xs leading-relaxed text-blue-700">
              Includes a secure link to complete a reference for{" "}
              <strong>{form.candidateName}</strong>. The response is verified by
              Vodora and permanently linked to the candidate&apos;s trust profile.
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-900">
                Email to Candidate
              </span>
            </div>
            <p className="text-sm font-medium text-green-800">
              {form.candidateName}
            </p>
            <p className="mb-3 text-xs text-green-600">{form.candidateEmail}</p>
            <p className="text-xs leading-relaxed text-green-700">
              Notified that a reference is being collected on their behalf.
              Invited to create a Vodora profile to save and own the reference
              once verified.
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 text-left">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Preview — Referee Email
          </p>
          <div className="mb-4 border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">
              From: <span className="text-gray-800">noreply@vodora.com</span>
            </p>
            <p className="text-sm text-gray-500">
              To: <span className="text-gray-800">{form.refereeEmail}</span>
            </p>
            <p className="text-sm text-gray-500">
              Subject:{" "}
              <span className="text-gray-800">
                Reference request for {form.candidateName} — from {recruiterName}{" "}
                at {companyLabel}
              </span>
            </p>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-gray-700">
            <p>Hi {form.refereeName},</p>
            <p>
              <strong>{recruiterName}</strong> from <strong>{companyLabel}</strong>{" "}
              is collecting a verified professional reference for{" "}
              <strong>{form.candidateName}</strong>
              {form.relationship
                ? `, who listed you as their ${form.relationship.toLowerCase()}`
                : ""}
              .
            </p>
            <p>
              Vodora is a professional trust platform that permanently links
              verified references to a candidate&apos;s identity — meaning you only
              need to provide this reference once. It will be securely stored and
              reused with {form.candidateName}&apos;s permission.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white">
              Complete Reference
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              vodora.com/ref/secure-link
            </div>
            <p className="pt-2 text-xs text-gray-400">
              This link expires in 14 days. Completing this reference takes
              approximately 5 minutes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Collect Another Reference
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="mb-1 text-xl font-semibold text-gray-900">
          Collect a Reference
        </h2>
        <p className="text-sm text-gray-500">
          Enter the candidate and referee details below. Vodora will email the
          referee a secure link to complete a verified reference, and notify the
          candidate so they can save it to their profile.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Candidate Details</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CollectReferenceField
              label="Full Name"
              required
              value={form.candidateName}
              onChange={(value) => update("candidateName", value)}
              placeholder="e.g. Sarah Johnson"
            />
            <CollectReferenceField
              label="Job Title"
              value={form.candidateTitle}
              onChange={(value) => update("candidateTitle", value)}
              placeholder="e.g. Senior Software Engineer"
            />
            <CollectReferenceField
              label="Company"
              value={form.candidateCompany}
              onChange={(value) => update("candidateCompany", value)}
              placeholder="e.g. Tech Corp"
            />
            <CollectReferenceField
              label="Candidate Email"
              required
              type="email"
              value={form.candidateEmail}
              onChange={(value) => update("candidateEmail", value)}
              placeholder="candidate@email.com"
            />
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-700">
              The candidate will receive an email notifying them that a reference
              is being collected on their behalf, and an invitation to create a
              free Vodora profile to permanently own and reuse this reference.
            </p>
          </div>
        </section>

        <div className="border-t border-gray-100" />

        <section>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
              <Briefcase className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Employment Context</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CollectReferenceField
              label="Role Being Referenced"
              value={form.jobTitle}
              onChange={(value) => update("jobTitle", value)}
              placeholder="e.g. Software Engineer"
            />
            <CollectReferenceField
              label="Employment Start"
              type="month"
              value={form.employmentStart}
              onChange={(value) => update("employmentStart", value)}
            />
            <CollectReferenceField
              label="Employment End"
              type="month"
              value={form.employmentEnd}
              onChange={(value) => update("employmentEnd", value)}
            />
          </div>
        </section>

        <div className="border-t border-gray-100" />

        <section>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Referee Details</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CollectReferenceField
              label="Referee Full Name"
              required
              value={form.refereeName}
              onChange={(value) => update("refereeName", value)}
              placeholder="e.g. John Smith"
            />
            <CollectReferenceField
              label="Referee Job Title"
              value={form.refereeTitle}
              onChange={(value) => update("refereeTitle", value)}
              placeholder="e.g. Engineering Manager"
            />
            <CollectReferenceField
              label="Referee Company"
              value={form.refereeCompany}
              onChange={(value) => update("refereeCompany", value)}
              placeholder="e.g. Tech Corp"
            />
            <CollectReferenceField
              label="Referee Email"
              required
              type="email"
              value={form.refereeEmail}
              onChange={(value) => update("refereeEmail", value)}
              placeholder="referee@company.com"
            />
            <CollectReferenceField
              label="Referee Phone"
              type="tel"
              value={form.refereePhone}
              onChange={(value) => update("refereePhone", value)}
              placeholder="+61 4XX XXX XXX"
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                Relationship to Candidate <span className="text-red-500">*</span>
              </label>
              <select
                value={form.relationship}
                onChange={(e) => update("relationship", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select relationship…</option>
                <option>Direct Manager</option>
                <option>Senior Manager</option>
                <option>Team Lead</option>
                <option>Colleague / Peer</option>
                <option>Client</option>
                <option>Mentor</option>
                <option>HR / People Team</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              Additional Notes for Referee (optional)
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Any context you'd like to share with the referee before they complete the form…"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <p className="mb-4 text-sm font-semibold text-gray-700">
            What happens when you send:
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <UserCheck className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Referee receives
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                  A secure, time-limited link to complete a structured reference.
                  Vodora verifies their corporate email before the response is
                  accepted.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Candidate receives
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                  A notification that a reference is being collected, plus an
                  invitation to create a free Vodora profile to permanently own
                  and reuse this reference.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">
            <span className="text-red-400">*</span> Required fields
          </p>
          <button
            type="button"
            onClick={handleSend}
            disabled={!isValid}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            <Send className="h-4 w-4" />
            Send Reference Request
          </button>
        </div>
      </div>
    </div>
  );
}

type CollectReferenceFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

function CollectReferenceField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: CollectReferenceFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
