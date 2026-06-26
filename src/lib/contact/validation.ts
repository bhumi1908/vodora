import { type FieldErrors, firstFieldError } from "@/lib/form/field-errors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CONTACT_SUBJECT_VALUES = [
  "general",
  "candidate",
  "recruiter",
  "enterprise",
  "press",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECT_VALUES)[number];

export const CONTACT_SUBJECT_LABELS: Record<ContactSubject, string> = {
  general: "General enquiry",
  candidate: "Candidate support",
  recruiter: "Recruiter support",
  enterprise: "Enterprise sales",
  press: "Press & media",
};

const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

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

  const name = input.name?.trim() ?? "";

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  const email = input.email?.trim() ?? "";

  if (!email) {
    errors.email = "Email address is required.";
  } else if (email.length > MAX_EMAIL_LENGTH) {
    errors.email = `Email must be ${MAX_EMAIL_LENGTH} characters or fewer.`;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  const subject = input.subject?.trim() ?? "";

  if (!subject) {
    errors.subject = "Please select a subject.";
  } else if (
    !CONTACT_SUBJECT_VALUES.includes(subject as ContactSubject)
  ) {
    errors.subject = "Please select a valid subject.";
  }

  const message = input.message?.trim() ?? "";

  if (!message) {
    errors.message = "Message is required.";
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;
  }

  return errors;
}

export function validateContact(input: Partial<ContactFormData>): string | null {
  return firstFieldError(getContactFieldErrors(input));
}
