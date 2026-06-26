import type { ProfileConnectionState } from "@/lib/connections/connection.types";

export type RecruiterProfileVisibilityOptions = {
  isOwnProfile?: boolean;
  candidateView?: boolean;
  connection?: ProfileConnectionState;
};

export type RecruiterProfileVisibility = {
  showContactDetails: boolean;
  showHiringPreferences: boolean;
  showOwnerActions: boolean;
  showConnectInHeader: boolean;
  showRestrictedNotice: boolean;
};

function isConnected(connection: ProfileConnectionState): boolean {
  return connection?.status === "connected";
}

export function resolveRecruiterProfileVisibility(
  options: RecruiterProfileVisibilityOptions,
): RecruiterProfileVisibility {
  const isOwnProfile = options.isOwnProfile ?? false;
  const candidateView = options.candidateView ?? false;
  const connected = isConnected(options.connection ?? null);

  const isOwnerView = isOwnProfile;
  const isCandidateExternalView = candidateView && !connected;

  return {
    showContactDetails: isOwnerView || (candidateView && connected),
    showHiringPreferences: isOwnerView || (candidateView && connected),
    showOwnerActions: isOwnerView,
    showConnectInHeader: candidateView,
    showRestrictedNotice: isCandidateExternalView,
  };
}

export function redactPrivateRecruiterProfileFields<
  T extends {
    email: string;
    phone: string | null;
    website: string | null;
    hiringPreferences?: {
      preferredWorkTypeCodes: string[];
      preferredExperienceLevels: string[];
      remotePreference: string | null;
    };
  },
>(profile: T, showPrivateFields: boolean): T {
  if (showPrivateFields) {
    return profile;
  }

  return {
    ...profile,
    email: "",
    phone: null,
    website: null,
    hiringPreferences: profile.hiringPreferences
      ? {
          preferredWorkTypeCodes: [],
          preferredExperienceLevels: [],
          remotePreference: null,
        }
      : profile.hiringPreferences,
  };
}
