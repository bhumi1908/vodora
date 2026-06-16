import type { Metadata } from "next";

import { TermsPage } from "@/components/static/TermsPage";

export const metadata: Metadata = {
  title: "Terms of Service — Vodora",
  description: "Vodora terms of service and platform usage agreement",
};

export default function TermsRoute() {
  return <TermsPage />;
}
