import type { Metadata } from "next";

import { PricingPage } from "@/components/pricing/PricingPage";

export const metadata: Metadata = {
  title: "Pricing — Vodora",
  description:
    "Simple transparent pricing for candidates and recruiters. Free profiles for candidates. 14-day free trial for recruiter plans.",
};

export default function PricingRoute() {
  return <PricingPage />;
}
