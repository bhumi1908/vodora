export const REFERENCE_RELATIONSHIP_OPTIONS = [
  { value: "direct_manager", label: "Direct Manager" },
  { value: "former_supervisor", label: "Former Supervisor" },
  { value: "colleague", label: "Colleague" },
  { value: "mentor", label: "Mentor" },
  { value: "client", label: "Client" },
  { value: "other", label: "Other" },
] as const;

export const REFERENCE_TYPE_OPTIONS = [
  { value: "written", label: "Written reference" },
  { value: "questionnaire", label: "Structured questionnaire" },
] as const;

export type ReferenceRelationship =
  (typeof REFERENCE_RELATIONSHIP_OPTIONS)[number]["value"];

export type ReferenceType = (typeof REFERENCE_TYPE_OPTIONS)[number]["value"];

/** Legacy DB values (e.g. rating) map to the written reference flow. */
export function normalizeReferenceType(value: string): ReferenceType {
  return value === "questionnaire" ? "questionnaire" : "written";
}

import { createEmptyQuestionnaireAnswers, type QuestionnaireAnswers } from "@/lib/references/reference-questionnaire";
import {
  createEmptyWrittenAssessmentAnswers,
  type WrittenAssessmentAnswers,
} from "@/lib/references/written-reference-assessment";

export type RequestReferenceFormData = {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: ReferenceRelationship | "";
  employmentStart: string;
  employmentEnd: string;
  referenceType: ReferenceType;
  message: string;
  /** Always true; kept for draft compatibility. Company email is required at validation. */
  requireCompanyEmail: boolean;
  employmentHistoryId: string;
};

export type ReferenceResponseFormData = {
  employmentConfirmed: boolean;
  positionHeld: string;
  employmentDatesConfirmed: boolean;
  writtenAssessmentAnswers: WrittenAssessmentAnswers;
  questionnaireAnswers: QuestionnaireAnswers;
  attestationConfirmed: boolean;
  signatureName: string;
  signatureDate: string;
  refereePhone: string;
  refereeLinkedIn: string;
  allowProfileCreation: boolean;
};

export function createEmptyReferenceRequest(): RequestReferenceFormData {
  return {
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    relationship: "",
    employmentStart: "",
    employmentEnd: "",
    referenceType: "written",
    message: "",
    requireCompanyEmail: true,
    employmentHistoryId: "",
  };
}

export function createEmptyReferenceResponse(
  overrides?: Partial<ReferenceResponseFormData>,
): ReferenceResponseFormData {
  return {
    employmentConfirmed: false,
    positionHeld: "",
    employmentDatesConfirmed: false,
    writtenAssessmentAnswers: createEmptyWrittenAssessmentAnswers(),
    questionnaireAnswers: createEmptyQuestionnaireAnswers(),
    attestationConfirmed: false,
    signatureName: "",
    signatureDate: new Date().toISOString().split("T")[0],
    refereePhone: "",
    refereeLinkedIn: "",
    allowProfileCreation: false,
    ...overrides,
  };
}

export function getRelationshipLabel(value: string): string {
  return (
    REFERENCE_RELATIONSHIP_OPTIONS.find((option) => option.value === value)
      ?.label ?? value
  );
}

export function getReferenceTypeLabel(value: string): string {
  const normalized = normalizeReferenceType(value);
  return (
    REFERENCE_TYPE_OPTIONS.find((option) => option.value === normalized)?.label ??
    value
  );
}

export function getReferenceStatusLabel(status: string): string {
  switch (status) {
    case "verified":
      return "Verified";
    case "submitted":
      return "Pending Review";
    case "pending":
      return "Awaiting Referee";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function getRefereeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
