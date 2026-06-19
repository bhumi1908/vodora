import { redirect } from "next/navigation";

import { MyProfileDataProvider } from "@/components/profile/MyProfileDataProvider";
import { getCachedAuthUser } from "@/lib/auth/cached-auth";
import { buildMinimalCandidateProfileFromAuth } from "@/lib/profile/build-minimal-candidate-profile";
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

  const fetchedProfile = await getCachedOwnCandidateProfileRaw(supabase);
  const rawProfile =
    fetchedProfile?.user != null
      ? fetchedProfile
      : buildMinimalCandidateProfileFromAuth(user);

  return (
    <MyProfileDataProvider rawProfile={rawProfile}>
      {children}
    </MyProfileDataProvider>
  );
}
