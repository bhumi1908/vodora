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
import {
  type FieldErrors,
  firstFieldError,
} from "@/lib/form/field-errors";

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

export type CandidateSignupFieldErrors = FieldErrors<
  keyof CandidateSignupRequest
>;

export function getCandidateSignupFieldErrors(
  input: Partial<CandidateSignupRequest>,
): CandidateSignupFieldErrors {
  const errors: CandidateSignupFieldErrors = {};

  if (!isNonEmpty(input.firstName)) {
    errors.firstName = "First name is required.";
  }

  if (!isNonEmpty(input.lastName)) {
    errors.lastName = "Last name is required.";
  }

  if (!isNonEmpty(input.email)) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!isNonEmpty(input.password)) {
    errors.password = "Password is required.";
  } else if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!isNonEmpty(input.country)) {
    errors.country = "Country is required.";
  }

  if (!isNonEmpty(input.city)) {
    errors.city = "City is required.";
  }

  if (!isNonEmpty(input.profession)) {
    errors.profession = "Profession is required.";
  }

  if (!isNonEmpty(input.industry)) {
    errors.industry = "Industry is required.";
  }

  if (!Array.isArray(input.workTypeCodes) || input.workTypeCodes.length === 0) {
    errors.workTypeCodes = "Please select at least one work availability option.";
  } else if (
    input.workTypeCodes.some(
      (code) => !WORK_TYPE_CODES.includes(code as (typeof WORK_TYPE_CODES)[number]),
    )
  ) {
    errors.workTypeCodes = "One or more work availability options are invalid.";
  }

  if (!input.agreedToTerms) {
    errors.agreedToTerms = "You must agree to the Terms of Service and Privacy Policy.";
  }

  return errors;
}

export function validateCandidateSignup(
  input: Partial<CandidateSignupRequest>,
): string | null {
  return firstFieldError(getCandidateSignupFieldErrors(input));
}

export type RecruiterSignupFieldErrors = FieldErrors<
  keyof RecruiterSignupRequest
>;

export function getRecruiterSignupFieldErrors(
  input: Partial<RecruiterSignupRequest>,
): RecruiterSignupFieldErrors {
  const errors: RecruiterSignupFieldErrors = {};

  if (!isNonEmpty(input.firstName)) {
    errors.firstName = "First name is required.";
  }

  if (!isNonEmpty(input.lastName)) {
    errors.lastName = "Last name is required.";
  }

  if (!isNonEmpty(input.email)) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = "Please enter a valid email address.";
  } else {
    const companyEmailError = validateCompanyEmail(input.email);

    if (companyEmailError) {
      errors.email = companyEmailError;
    }
  }

  if (!isNonEmpty(input.password)) {
    errors.password = "Password is required.";
  } else if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!isNonEmpty(input.companyName)) {
    errors.companyName = "Company name is required.";
  }

  if (!isNonEmpty(input.position)) {
    errors.position = "Position is required.";
  }

  if (!isNonEmpty(input.country)) {
    errors.country = "Country is required.";
  }

  if (!isNonEmpty(input.city)) {
    errors.city = "City is required.";
  }

  if (!isNonEmpty(input.website)) {
    errors.website = "Company website is required.";
  }

  if (
    !isNonEmpty(input.employeeCount) ||
    !EMPLOYEE_COUNT_VALUES.includes(
      input.employeeCount as (typeof EMPLOYEE_COUNT_VALUES)[number],
    )
  ) {
    errors.employeeCount = "Please select the number of employees.";
  }

  if (
    !isNonEmpty(input.hiresPerYear) ||
    !HIRES_PER_YEAR_VALUES.includes(
      input.hiresPerYear as (typeof HIRES_PER_YEAR_VALUES)[number],
    )
  ) {
    errors.hiresPerYear = "Please select hires per year.";
  }

  if (
    !isNonEmpty(input.recruiterType) ||
    !RECRUITER_TYPE_VALUES.includes(
      input.recruiterType as (typeof RECRUITER_TYPE_VALUES)[number],
    )
  ) {
    errors.recruiterType = "Please select a recruiter type.";
  }

  if (!input.agreedToTerms) {
    errors.agreedToTerms = "You must agree to the Terms of Service and Privacy Policy.";
  }

  return errors;
}

export function validateRecruiterSignup(
  input: Partial<RecruiterSignupRequest>,
): string | null {
  return firstFieldError(getRecruiterSignupFieldErrors(input));
}

export type LoginFieldErrors = FieldErrors<"email" | "password">;

export function getLoginFieldErrors(input: {
  email?: string;
  password?: string;
  isRecruiterLogin?: boolean;
}): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  const email = input.email?.trim() ?? "";
  const password = input.password ?? "";

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  } else if (input.isRecruiterLogin) {
    const companyEmailError = validateCompanyEmail(email);

    if (companyEmailError) {
      errors.email = companyEmailError;
    }
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function validateLogin(input: {
  email?: string;
  password?: string;
  isRecruiterLogin?: boolean;
}): string | null {
  return firstFieldError(getLoginFieldErrors(input));
}

export type ResetPasswordFieldErrors = FieldErrors<
  "password" | "confirmPassword"
>;

export function getResetPasswordFieldErrors(input: {
  password?: string;
  confirmPassword?: string;
}): ResetPasswordFieldErrors {
  const errors: ResetPasswordFieldErrors = {};
  const password = input.password ?? "";
  const confirmPassword = input.confirmPassword ?? "";

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function validateResetPassword(input: {
  password?: string;
  confirmPassword?: string;
}): string | null {
  return firstFieldError(getResetPasswordFieldErrors(input));
}

export type ForgotPasswordFieldErrors = FieldErrors<"email">;

export function getForgotPasswordFieldErrors(input: {
  email?: string;
}): ForgotPasswordFieldErrors {
  const errors: ForgotPasswordFieldErrors = {};
  const email = input.email?.trim() ?? "";

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}

export function validateForgotPassword(input: {
  email?: string;
}): string | null {
  return firstFieldError(getForgotPasswordFieldErrors(input));
}
