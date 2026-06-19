import type { User } from "@supabase/supabase-js";

import type { OwnCandidateProfileRpcResult } from "@/lib/profile/own-candidate-profile-rpc.types";

export function buildMinimalCandidateProfileFromAuth(
  user: User,
): OwnCandidateProfileRpcResult {
  const firstName =
    typeof user.user_metadata?.first_name === "string"
      ? user.user_metadata.first_name.trim()
      : "";
  const lastName =
    typeof user.user_metadata?.last_name === "string"
      ? user.user_metadata.last_name.trim()
      : "";

  return {
    user: {
      id: user.id,
      first_name: firstName || "User",
      last_name: lastName || "",
      email: user.email ?? "",
      phone: null,
      city: null,
      country: null,
    },
    candidate: null,
    skills: [],
    employment: [],
    education: [],
    documents: [],
  };
}
