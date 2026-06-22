import { redirect } from "next/navigation";

import { RECRUITER_PROFILE_PATH } from "@/lib/auth/routes";

export default function RecruiterProfileEditRoutePage() {
  redirect(RECRUITER_PROFILE_PATH);
}
