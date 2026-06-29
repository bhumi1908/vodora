export const DEFAULT_EMAIL_FORMAT_ERROR = "Please enter a valid email address.";

export const INVALID_EMAIL_CHARACTERS_ERROR =
  "Enter a valid email address. Remove spaces, apostrophes, and other special characters.";

/** Characters rejected by most SMTP servers (RFC 5321 practical subset). */
const DISALLOWED_EMAIL_CHARS = /['"\s(),:;<>\\[\]]/;

/** Domain labels: letters, digits, hyphens, and dots only. */
const EMAIL_DOMAIN_PATTERN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const EMAIL_LOCAL_PART_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;

const MAX_EMAIL_LENGTH = 254;

export function getEmailFormatError(email: string): string | null {
  const trimmed = email.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > MAX_EMAIL_LENGTH) {
    return DEFAULT_EMAIL_FORMAT_ERROR;
  }

  if (DISALLOWED_EMAIL_CHARS.test(trimmed)) {
    return INVALID_EMAIL_CHARACTERS_ERROR;
  }

  const atIndex = trimmed.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return DEFAULT_EMAIL_FORMAT_ERROR;
  }

  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  if (!localPart || !domain || !domain.includes(".")) {
    return DEFAULT_EMAIL_FORMAT_ERROR;
  }

  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) {
    return DEFAULT_EMAIL_FORMAT_ERROR;
  }

  if (!EMAIL_LOCAL_PART_PATTERN.test(localPart)) {
    return INVALID_EMAIL_CHARACTERS_ERROR;
  }

  if (!EMAIL_DOMAIN_PATTERN.test(domain)) {
    return INVALID_EMAIL_CHARACTERS_ERROR;
  }

  return null;
}

export function isValidEmailFormat(email: string): boolean {
  return getEmailFormatError(email) === null;
}
