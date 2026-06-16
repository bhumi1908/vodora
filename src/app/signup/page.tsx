import type { Metadata } from "next";

import { SignupChooserPage } from "@/components/auth/SignupChooserPage";

export const metadata: Metadata = {
  title: "Join Vodora",
  description: "Choose how you want to use Vodora — candidate or recruiter",
};

export default function SignupRoute() {
  return <SignupChooserPage />;
}
