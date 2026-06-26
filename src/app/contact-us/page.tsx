import type { Metadata } from "next";

import { ContactPage } from "@/components/static/ContactPage";
import { getContactDisplayEmails } from "@/lib/contact/contact-emails";

export const metadata: Metadata = {
  title: "Contact Us — Vodora",
  description: "Get in touch with the Vodora team",
};

export default function ContactRoute() {
  const contactEmails = getContactDisplayEmails();

  return <ContactPage contactEmails={contactEmails} />;
}
