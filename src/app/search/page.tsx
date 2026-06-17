import { redirect } from "next/navigation";

import { RECRUITER_DASHBOARD_PATH } from "@/lib/auth/routes";

export default function LegacyRecruiterSearchRedirect() {
  redirect(RECRUITER_DASHBOARD_PATH);
}
