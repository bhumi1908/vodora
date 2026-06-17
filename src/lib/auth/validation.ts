import {
  EMPLOYEE_COUNT_VALUES,
  HIRES_PER_YEAR_VALUES,
  MIN_PASSWORD_LENGTH,
  PERSONAL_EMAIL_DOMAINS,
  RECRUITER_TYPE_VALUES,
  WORK_TYPE_CODES,
} from "@/lib/auth/constants";
import type {
  CandidateSignupRequest,
  RecruiterSignupRequest,
} from "@/lib/auth/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COMPANY_EMAIL_ERROR =
  "Please use a company email address. Personal email providers such as Gmail are not allowed for recruiter accounts.";

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function getEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return null;
  }

  return trimmed.slice(atIndex + 1);
}

export function isPersonalEmail(email: string): boolean {
  const domain = getEmailDomain(email);

  if (!domain) {
    return false;
  }

  return PERSONAL_EMAIL_DOMAINS.includes(
    domain as (typeof PERSONAL_EMAIL_DOMAINS)[number],
  );
}

export function validateCompanyEmail(email: string): string | null {
  if (isPersonalEmail(email)) {
    return COMPANY_EMAIL_ERROR;
  }

  return null;
}

export function validateCandidateSignup(
  input: Partial<CandidateSignupRequest>,
): string | null {
  if (!isNonEmpty(input.firstName)) return "First name is required.";
  if (!isNonEmpty(input.lastName)) return "Last name is required.";
  if (!isNonEmpty(input.email) || !EMAIL_PATTERN.test(input.email.trim())) {
    return "Please enter a valid email address.";
  }
  if (!isNonEmpty(input.password) || input.password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!isNonEmpty(input.country)) return "Country is required.";
  if (!isNonEmpty(input.city)) return "City is required.";
  if (!isNonEmpty(input.profession)) return "Profession is required.";
  if (!isNonEmpty(input.industry)) return "Industry is required.";
  if (!Array.isArray(input.workTypeCodes) || input.workTypeCodes.length === 0) {
    return "Please select at least one work availability option.";
  }
  if (
    input.workTypeCodes.some(
      (code) => !WORK_TYPE_CODES.includes(code as (typeof WORK_TYPE_CODES)[number]),
    )
  ) {
    return "One or more work availability options are invalid.";
  }
  if (!input.agreedToTerms) {
    return "You must agree to the Terms of Service and Privacy Policy.";
  }

  return null;
}

export function validateRecruiterSignup(
  input: Partial<RecruiterSignupRequest>,
): string | null {
  if (!isNonEmpty(input.firstName)) return "First name is required.";
  if (!isNonEmpty(input.lastName)) return "Last name is required.";
  if (!isNonEmpty(input.email) || !EMAIL_PATTERN.test(input.email.trim())) {
    return "Please enter a valid email address.";
  }
  const companyEmailError = validateCompanyEmail(input.email);
  if (companyEmailError) {
    return companyEmailError;
  }
  if (!isNonEmpty(input.password) || input.password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!isNonEmpty(input.companyName)) return "Company name is required.";
  if (!isNonEmpty(input.position)) return "Position is required.";
  if (!isNonEmpty(input.country)) return "Country is required.";
  if (!isNonEmpty(input.city)) return "City is required.";
  if (!isNonEmpty(input.website)) return "Company website is required.";
  if (
    !isNonEmpty(input.employeeCount) ||
    !EMPLOYEE_COUNT_VALUES.includes(
      input.employeeCount as (typeof EMPLOYEE_COUNT_VALUES)[number],
    )
  ) {
    return "Please select the number of employees.";
  }
  if (
    !isNonEmpty(input.hiresPerYear) ||
    !HIRES_PER_YEAR_VALUES.includes(
      input.hiresPerYear as (typeof HIRES_PER_YEAR_VALUES)[number],
    )
  ) {
    return "Please select hires per year.";
  }
  if (
    !isNonEmpty(input.recruiterType) ||
    !RECRUITER_TYPE_VALUES.includes(
      input.recruiterType as (typeof RECRUITER_TYPE_VALUES)[number],
    )
  ) {
    return "Please select a recruiter type.";
  }
  if (!input.agreedToTerms) {
    return "You must agree to the Terms of Service and Privacy Policy.";
  }

  return null;
}
