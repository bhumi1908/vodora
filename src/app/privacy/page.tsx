import type { Metadata } from "next";

import { PrivacyPage } from "@/components/static/PrivacyPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Vodora",
  description: "Vodora privacy policy and data protection information",
};

export default function PrivacyRoute() {
  return <PrivacyPage />;
}
