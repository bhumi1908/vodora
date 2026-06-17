import { redirect } from "next/navigation";

import { getAccountType } from "@/lib/auth/account-type";
import { getRouteProtectionRedirect } from "@/lib/auth/route-protection";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Search — Vodora",
  description: "Recruiter search dashboard.",
};

export default async function RecruiterSearchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    "/search",
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "recruiter") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-gray-900">
        Recruiter Search — In Progress
      </h1>
    </div>
  );
}
