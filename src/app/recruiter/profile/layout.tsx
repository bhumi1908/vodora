import { redirect } from "next/navigation";

import { MyRecruiterProfileDataProvider } from "@/components/recruiter/MyRecruiterProfileDataProvider";
import { getCachedOwnRecruiterProfileRaw } from "@/lib/recruiter/fetch-own-recruiter-profile";
import { createClient } from "@/lib/supabase/server";

export default async function RecruiterProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/recruiter/profile");
  }

  const rawProfile = await getCachedOwnRecruiterProfileRaw(supabase);

  if (!rawProfile?.user) {
    redirect("/login?redirect=/recruiter/profile");
  }

  return (
    <MyRecruiterProfileDataProvider rawProfile={rawProfile}>
      {children}
    </MyRecruiterProfileDataProvider>
  );
}
