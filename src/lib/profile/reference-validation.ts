import { type FieldErrors, firstFieldError } from "@/lib/form/field-errors";

import type { RequestReferenceFormData } from "@/components/profile/reference/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ReferenceFieldErrors = FieldErrors<keyof RequestReferenceFormData>;

export function getReferenceFieldErrors(
  input: Partial<RequestReferenceFormData>,
): ReferenceFieldErrors {
  const errors: ReferenceFieldErrors = {};

  if (!input.name?.trim()) {
    errors.name = "Name is required.";
  }

  if (!input.title?.trim()) {
    errors.title = "Title is required.";
  }

  if (!input.company?.trim()) {
    errors.company = "Company is required.";
  }

  if (!input.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!input.phone?.trim()) {
    errors.phone = "Phone is required.";
  }

  if (!input.relationship) {
    errors.relationship = "Relationship is required.";
  }

  return errors;
}

export function validateReferenceRequest(
  input: Partial<RequestReferenceFormData>,
): string | null {
  return firstFieldError(getReferenceFieldErrors(input));
}
