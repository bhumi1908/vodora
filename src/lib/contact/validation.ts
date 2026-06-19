import { type FieldErrors, firstFieldError } from "@/lib/form/field-errors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUBJECT_VALUES = [
  "general",
  "candidate",
  "recruiter",
  "enterprise",
  "press",
] as const;

export type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactFieldErrors = FieldErrors<keyof ContactFormData>;

export function getContactFieldErrors(
  input: Partial<ContactFormData>,
): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  if (!input.name?.trim()) {
    errors.name = "Name is required.";
  }

  if (!input.email?.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!input.subject?.trim()) {
    errors.subject = "Please select a subject.";
  } else if (
    !SUBJECT_VALUES.includes(input.subject as (typeof SUBJECT_VALUES)[number])
  ) {
    errors.subject = "Please select a valid subject.";
  }

  if (!input.message?.trim()) {
    errors.message = "Message is required.";
  }

  return errors;
}

export function validateContact(input: Partial<ContactFormData>): string | null {
  return firstFieldError(getContactFieldErrors(input));
}
