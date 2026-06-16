import { LegalDocumentPage } from "@/components/static/StaticPageLayout";

const privacySections = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly to us when creating a profile, requesting references, or contacting us. This includes name, email address, employment history, and professional references. We also collect usage data to improve our services.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to provide and improve our services, verify professional references, communicate with you, and personalise your experience. We do not sell your personal data to third parties.",
  },
  {
    title: "3. Reference Privacy",
    body: "References on your profile are private by default. They are only visible to you and people you explicitly share them with. We blur all reference content for general visitors and unauthenticated users.",
  },
  {
    title: "4. Data Sharing",
    body: "We share your data only with your explicit consent, with verified recruiters you choose to share with, and with service providers who help us operate our platform under strict confidentiality agreements.",
  },
  {
    title: "5. Data Security",
    body: "We implement industry-standard security measures including encryption in transit and at rest, regular security audits, and access controls to protect your personal information.",
  },
  {
    title: "6. Your Rights",
    body: "You have the right to access, correct, or delete your personal data at any time. You can export your data or deactivate your account from your profile settings. For GDPR requests, contact privacy@vodora.com.",
  },
  {
    title: "7. Contact Us",
    body: "If you have questions about this Privacy Policy, please contact our Privacy team at privacy@vodora.com.",
  },
];

export function PrivacyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      lastUpdated="June 2026"
      sections={privacySections}
    />
  );
}
