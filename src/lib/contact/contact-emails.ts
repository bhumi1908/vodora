import { env } from "@/lib/env";

export function getContactInboxEmail(): string | null {
  const email = env.CONTACT_INBOX_EMAIL.trim();

  return email || null;
}

export function getContactHelloEmail(): string | null {
  const email = env.CONTACT_HELLO_EMAIL.trim();

  return email || null;
}

export function getContactSupportEmail(): string | null {
  const email = env.CONTACT_SUPPORT_EMAIL.trim();

  return email || null;
}

export function getContactDisplayEmails(): string[] {
  return [getContactHelloEmail(), getContactSupportEmail()].filter(
    (email): email is string => Boolean(email),
  );
}
