"use client";

import { Mail, MapPin, MessageSquare } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  AuthSubmitButton,
  FormField,
  FormSelect,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import { ContactInfoItem } from "@/components/static/ContactInfoItem";
import {
  StaticPageHeader,
  StaticPageShell,
} from "@/components/static/StaticPageLayout";

const subjectOptions = [
  { value: "general", label: "General enquiry" },
  { value: "candidate", label: "Candidate support" },
  { value: "recruiter", label: "Recruiter support" },
  { value: "enterprise", label: "Enterprise sales" },
  { value: "press", label: "Press & media" },
];

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialData: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>(initialData);

  function updateField<K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <StaticPageShell>
      <StaticPageHeader
        title="Contact Us"
        description="We'd love to hear from you. Reach out and our team will get back to you promptly."
        large
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            id="contact-name"
            label="Name"
            required
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Your name"
          />
          <FormField
            id="contact-email"
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@example.com"
          />
          <FormSelect
            id="contact-subject"
            label="Subject"
            required
            value={formData.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            options={subjectOptions}
          />
          <FormTextarea
            id="contact-message"
            label="Message"
            required
            rows={5}
            value={formData.message}
            onChange={(e) => updateField("message", e.target.value)}
            placeholder="How can we help?"
          />
          <AuthSubmitButton>Send Message</AuthSubmitButton>
        </form>

        <div className="space-y-8">
          <ContactInfoItem
            icon={Mail}
            title="Email"
            lines={["hello@vodora.com", "support@vodora.com"]}
          />
          <ContactInfoItem
            icon={MessageSquare}
            title="Live Chat"
            lines={["Available Mon–Fri, 9am–6pm AEST"]}
          />
          <ContactInfoItem
            icon={MapPin}
            title="Office"
            lines={["Sydney, Australia"]}
          />
        </div>
      </div>
    </StaticPageShell>
  );
}
