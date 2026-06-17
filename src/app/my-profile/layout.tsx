import { redirect } from "next/navigation";

import { MyProfileDataProvider } from "@/components/profile/MyProfileDataProvider";
import { getCachedAuthUser } from "@/lib/auth/cached-auth";
import { getCachedOwnCandidateProfileRaw } from "@/lib/profile/fetch-own-candidate-profile";
import { createClient } from "@/lib/supabase/server";

export default async function MyProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const user = await getCachedAuthUser(supabase);

  if (!user) {
    redirect("/login?redirect=/my-profile");
  }

  const rawProfile = await getCachedOwnCandidateProfileRaw(supabase);

  if (!rawProfile?.user) {
    redirect("/login?redirect=/my-profile");
  }

  return (
    <MyProfileDataProvider rawProfile={rawProfile}>
      {children}
    </MyProfileDataProvider>
  );
}
