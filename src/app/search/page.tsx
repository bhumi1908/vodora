import { redirect } from "next/navigation";

import { RECRUITER_SEARCH_PATH } from "@/lib/auth/routes";

export default function LegacyRecruiterSearchRedirect() {
  redirect(RECRUITER_SEARCH_PATH);
}
