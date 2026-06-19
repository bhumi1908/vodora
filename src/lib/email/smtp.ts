import "server-only";

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";

import { getSmtpConfig, isSmtpConfigured } from "@/lib/email/smtp-config";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Attachment[];
};

type SendEmailResult =
  | { success: true }
  | { success: false; error: string };

let transporter: Transporter | null = null;
let transporterKey: string | null = null;

function getTransporter(): Transporter | { error: string } {
  const config = getSmtpConfig();

  if ("error" in config) {
    return config;
  }

  const key = `${config.host}:${config.port}:${config.user}:${config.secure}`;

  if (!transporter || transporterKey !== key) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    transporterKey = key;
  }

  return transporter;
}

export async function sendEmail(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  if (!isSmtpConfigured()) {
    console.error("SMTP email service is not configured.");
    return { success: false, error: "Email service is not configured." };
  }

  const transport = getTransporter();

  if ("error" in transport) {
    console.error(transport.error);
    return { success: false, error: "Email service is not configured." };
  }

  const config = getSmtpConfig();

  if ("error" in config) {
    console.error(config.error);
    return { success: false, error: "Email service is not configured." };
  }

  try {
    await transport.sendMail({
      from: {
        name: config.fromName,
        address: config.fromEmail,
      },
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
      attachments: params.attachments,
    });

    return { success: true };
  } catch (error) {
    console.error("SMTP send failed:", error);
    return {
      success: false,
      error: "Unable to send email. Please try again later.",
    };
  }
}
