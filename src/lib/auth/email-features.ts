import { isSmtpConfigured } from "@/lib/email/smtp-config";

/**
 * SMTP email delivery and email-verification gates.
 * Enabled automatically when SMTP env vars are configured.
 */
export const EMAIL_FEATURES_ENABLED = isSmtpConfigured();
