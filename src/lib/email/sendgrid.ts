import { EMAIL_FEATURES_ENABLED } from "@/lib/auth/email-features";
import { env } from "@/lib/env";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type SendEmailResult =
  | { success: true }
  | { success: false; error: string };

function getSendGridConfig():
  | { apiKey: string; fromEmail: string; fromName: string }
  | { error: string } {
  const apiKey = env.SENDGRID_API_KEY.trim();
  const fromEmail = env.SENDGRID_FROM_EMAIL.trim().toLowerCase();
  const fromName = env.SENDGRID_FROM_NAME.trim() || "Vodora";

  if (!apiKey) {
    return { error: "SENDGRID_API_KEY is not configured." };
  }

  if (!apiKey.startsWith("SG.")) {
    return {
      error:
        "SENDGRID_API_KEY looks invalid. Create a key in SendGrid (starts with SG.).",
    };
  }

  if (!fromEmail) {
    return { error: "SENDGRID_FROM_EMAIL is not configured." };
  }

  return { apiKey, fromEmail, fromName };
}

export async function sendEmail(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  // Email delivery disabled until SendGrid is ready — see email-features.ts.
  if (!EMAIL_FEATURES_ENABLED) {
    return { success: true };
  }

  const config = getSendGridConfig();

  if ("error" in config) {
    console.error(config.error);
    return { success: false, error: "Email service is not configured." };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to }] }],
        from: { email: config.fromEmail, name: config.fromName },
        subject: params.subject,
        content: [
          { type: "text/plain", value: params.text },
          { type: "text/html", value: params.html },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("SendGrid error:", response.status, body);
      return { success: false, error: "Unable to send email. Please try again later." };
    }

    return { success: true };
  } catch (error) {
    console.error("SendGrid request failed:", error);
    return { success: false, error: "Unable to send email. Please try again later." };
  }
}
