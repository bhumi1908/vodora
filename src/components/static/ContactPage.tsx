"use client";

import { Mail, MapPin, MessageSquare } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  AuthSubmitButton,
  FormError,
  FormField,
  FormSelect,
  FormSuccess,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import { ContactInfoItem } from "@/components/static/ContactInfoItem";
import {
  StaticPageHeader,
  StaticPageShell,
} from "@/components/static/StaticPageLayout";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import {
  getContactFieldErrors,
  type ContactFieldErrors,
  type ContactFormData,
} from "@/lib/contact/validation";
import type { ContactApiResponse } from "@/lib/contact/contact-api.types";
import { hasFieldErrors } from "@/lib/form/field-errors";

const subjectOptions = [
  { value: "general", label: "General enquiry" },
  { value: "candidate", label: "Candidate support" },
  { value: "recruiter", label: "Recruiter support" },
  { value: "enterprise", label: "Enterprise sales" },
  { value: "press", label: "Press & media" },
];

const initialData: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

type ContactPageProps = {
  contactEmails?: string[];
};

export function ContactPage({ contactEmails = [] }: ContactPageProps) {
  const [formData, setFormData] = useState<ContactFormData>(initialData);
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof ContactFieldErrors>();
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function updateField<K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearField(field);
    setSuccessMessage("");
    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    setSubmitError("");

    const fieldErrors = getContactFieldErrors(formData);

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as ContactApiResponse;

      if (!response.ok) {
        if (data.fieldErrors && hasFieldErrors(data.fieldErrors)) {
          setErrors(data.fieldErrors);
        }

        setSubmitError(
          data.error ?? "Something went wrong. Please try again.",
        );
        return;
      }

      setErrors({});
      setSuccessMessage("Thanks for reaching out. We'll get back to you soon.");
      setFormData(initialData);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StaticPageShell>
      <StaticPageHeader
        title="Contact Us"
        description="We'd love to hear from you. Reach out and our team will get back to you promptly."
        large
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {successMessage ? (
            <FormSuccess title="Message sent" message={successMessage} />
          ) : null}

          {submitError ? <FormError message={submitError} /> : null}

          <FormField
            id="contact-name"
            label="Name"
            required
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Your name"
            error={errors.name}
          />
          <FormField
            id="contact-email"
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
          />
          <FormSelect
            id="contact-subject"
            label="Subject"
            required
            value={formData.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            options={subjectOptions}
            error={errors.subject}
          />
          <FormTextarea
            id="contact-message"
            label="Message"
            required
            rows={5}
            value={formData.message}
            onChange={(e) => updateField("message", e.target.value)}
            placeholder="How can we help?"
            error={errors.message}
          />
          <AuthSubmitButton disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </AuthSubmitButton>
        </form>

        <div className="space-y-8">
          {contactEmails.length > 0 ? (
            <ContactInfoItem
              icon={Mail}
              title="Email"
              lines={contactEmails}
            />
          ) : null}
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
