import type { Metadata } from "next";

import { ContactPage } from "@/components/static/ContactPage";

export const metadata: Metadata = {
  title: "Contact Us — Vodora",
  description: "Get in touch with the Vodora team",
};

export default function ContactRoute() {
  return <ContactPage />;
}
