import { LegalDocumentPage } from "@/components/static/StaticPageLayout";

const termsSections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using Vodora, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.",
  },
  {
    title: "2. Platform Use",
    body: "Vodora provides a professional trust and reference platform. You agree to use the platform only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use of the platform.",
  },
  {
    title: "3. Account Responsibility",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use.",
  },
  {
    title: "4. Accurate Information",
    body: "You agree to provide accurate, current, and complete information in your profile and references. Misrepresentation of professional credentials or references is grounds for immediate account termination.",
  },
  {
    title: "5. Reference Integrity",
    body: "References must be genuine and provided by people who directly supervised or worked with you. Submitting fabricated references is strictly prohibited and may result in legal action.",
  },
  {
    title: "6. Intellectual Property",
    body: "Vodora and its original content, features, and functionality are owned by Vodora Pty Ltd and are protected by Australian and international copyright, trademark, and other intellectual property laws.",
  },
  {
    title: "7. Termination",
    body: "We reserve the right to terminate or suspend accounts that violate these Terms of Service, with or without notice, at our sole discretion.",
  },
  {
    title: "8. Contact",
    body: "For questions about these Terms, contact legal@vodora.com.",
  },
];

export function TermsPage() {
  return (
    <LegalDocumentPage
      title="Terms of Service"
      lastUpdated="June 2026"
      sections={termsSections}
    />
  );
}
