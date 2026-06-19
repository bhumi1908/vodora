import { env } from "@/lib/env";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
};

export function isSmtpConfigured(): boolean {
  return (
    env.SMTP_HOST.trim() !== "" &&
    env.SMTP_USER.trim() !== "" &&
    env.SMTP_PASS.trim() !== "" &&
    env.SMTP_FROM_EMAIL.trim() !== ""
  );
}

export function getSmtpConfig(): SmtpConfig | { error: string } {
  const host = env.SMTP_HOST.trim();
  const user = env.SMTP_USER.trim();
  const pass = env.SMTP_PASS;
  const fromEmail = env.SMTP_FROM_EMAIL.trim().toLowerCase();
  const fromName = env.SMTP_FROM_NAME.trim() || "Vodora";

  if (!host) {
    return { error: "SMTP_HOST is not configured." };
  }

  if (!user) {
    return { error: "SMTP_USER is not configured." };
  }

  if (!pass.trim()) {
    return { error: "SMTP_PASS is not configured." };
  }

  if (!fromEmail) {
    return { error: "SMTP_FROM_EMAIL is not configured." };
  }

  const port = Number.parseInt(env.SMTP_PORT.trim() || "587", 10);
  const secure =
    env.SMTP_SECURE.trim().toLowerCase() === "true" || port === 465;

  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    user,
    pass,
    fromEmail,
    fromName,
  };
}
