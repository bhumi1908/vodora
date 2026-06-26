import "server-only";

import {
  CONTACT_SUBJECT_LABELS,
  type ContactFormData,
  type ContactSubject,
  validateContact,
} from "@/lib/contact/validation";
import {
  buildContactConfirmationHtml,
  buildContactConfirmationText,
} from "@/lib/email/templates/contact-confirmation";
import {
  buildContactSubmissionHtml,
  buildContactSubmissionText,
} from "@/lib/email/templates/contact-submission";
import { getContactHelloEmail, getContactInboxEmail } from "@/lib/contact/contact-emails";
import { sendEmail } from "@/lib/email/smtp";
import { createAdminClient } from "@/lib/supabase/admin";

export type SubmitContactResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

function normalizePayload(
  input: Partial<ContactFormData>,
): ContactFormData | null {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const subject = input.subject?.trim() ?? "";
  const message = input.message?.trim() ?? "";

  if (!name || !email || !subject || !message) {
    return null;
  }

  return { name, email, subject, message };
}

function getSubjectLabel(payload: ContactFormData): string {
  return (
    CONTACT_SUBJECT_LABELS[payload.subject as ContactSubject] ??
    payload.subject
  );
}

async function notifyContactInbox(payload: ContactFormData): Promise<void> {
  const inboxEmail = getContactInboxEmail();

  if (!inboxEmail) {
    console.error("CONTACT_INBOX_EMAIL is not configured.");
    return;
  }

  const subjectLabel = getSubjectLabel(payload);

  const emailResult = await sendEmail({
    to: inboxEmail,
    subject: `Contact form: ${subjectLabel} — ${payload.name}`,
    html: buildContactSubmissionHtml({
      name: payload.name,
      email: payload.email,
      subjectLabel,
      message: payload.message,
    }),
    text: buildContactSubmissionText({
      name: payload.name,
      email: payload.email,
      subjectLabel,
      message: payload.message,
    }),
  });

  if (!emailResult.success) {
    console.error("Contact form notification email failed:", emailResult.error);
  }
}

async function sendContactConfirmation(payload: ContactFormData): Promise<void> {
  const subjectLabel = getSubjectLabel(payload);
  const urgentContactEmail = getContactHelloEmail();

  const emailResult = await sendEmail({
    to: payload.email,
    subject: "We received your message — Vodora",
    html: buildContactConfirmationHtml({
      recipientName: payload.name,
      subjectLabel,
      urgentContactEmail,
    }),
    text: buildContactConfirmationText({
      recipientName: payload.name,
      subjectLabel,
      urgentContactEmail,
    }),
  });

  if (!emailResult.success) {
    console.error("Contact form confirmation email failed:", emailResult.error);
  }
}

async function deliverContactEmails(payload: ContactFormData): Promise<void> {
  await Promise.all([
    notifyContactInbox(payload),
    sendContactConfirmation(payload),
  ]);
}

export async function submitContact(
  input: Partial<ContactFormData>,
  clientIp: string | null,
): Promise<SubmitContactResult> {
  const validationError = validateContact(input);

  if (validationError) {
    return { success: false, error: validationError };
  }

  const payload = normalizePayload(input);

  if (!payload) {
    return { success: false, error: "All fields are required." };
  }

  const admin = createAdminClient();

  const { error } = await admin.from("contact_submissions").insert({
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
    client_ip: clientIp,
  });

  if (error) {
    console.error("Contact submission insert failed:", error);
    return {
      success: false,
      error: "Unable to send your message. Please try again later.",
    };
  }

  void deliverContactEmails(payload);

  return { success: true };
}
