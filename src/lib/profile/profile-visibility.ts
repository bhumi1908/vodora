import type { ProfileConnectionState } from "@/lib/connections/connection.types";
import type { CandidateProfileData } from "@/lib/profile/types";

export type ProfileTabId =
  | "overview"
  | "experience"
  | "education"
  | "skills"
  | "references"
  | "documents"
  | "jobs";

const ALL_TABS: ProfileTabId[] = [
  "overview",
  "experience",
  "education",
  "skills",
  "references",
  "documents",
  "jobs",
];

const BASIC_EXTERNAL_TABS: ProfileTabId[] = ["overview", "experience", "skills"];

export type ProfileVisibilityOptions = {
  isOwnProfile?: boolean;
  visitorPreview?: boolean;
  recruiterView?: boolean;
  connection?: ProfileConnectionState;
  hasReferenceAccess?: boolean;
};

export type ProfileVisibility = {
  showContactDetails: boolean;
  showAvailability: boolean;
  showVodoraId: boolean;
  showOwnerActions: boolean;
  showVisitorBanner: boolean;
  showRestrictedNotice: boolean;
  showConnectInHeader: boolean;
  showConnectPreview: boolean;
  visibleTabIds: ProfileTabId[];
};

function isConnected(connection: ProfileConnectionState): boolean {
  return connection?.status === "connected";
}

export function resolveProfileVisibility(
  options: ProfileVisibilityOptions,
): ProfileVisibility {
  const isOwnProfile = options.isOwnProfile ?? false;
  const visitorPreview = options.visitorPreview ?? false;
  const recruiterView = options.recruiterView ?? false;
  const hasReferenceAccess = options.hasReferenceAccess ?? false;
  const connected = isConnected(options.connection ?? null);

  const isOwnerView = isOwnProfile && !visitorPreview;
  const isBasicExternalView =
    visitorPreview || (recruiterView && !connected);
  const isConnectedRecruiterView = recruiterView && connected;

  const showPrivateDetails = isOwnerView || isConnectedRecruiterView;
  const baseTabIds = isBasicExternalView ? BASIC_EXTERNAL_TABS : ALL_TABS;
  const visibleTabIds =
    isOwnerView || hasReferenceAccess
      ? baseTabIds
      : baseTabIds.filter((tabId) => tabId !== "references");

  return {
    showContactDetails: showPrivateDetails,
    showAvailability: showPrivateDetails,
    showVodoraId: isOwnerView,
    showOwnerActions: isOwnerView,
    showVisitorBanner: visitorPreview,
    showRestrictedNotice: isBasicExternalView,
    showConnectInHeader: recruiterView && !visitorPreview,
    showConnectPreview: visitorPreview,
    visibleTabIds,
  };
}

export function redactPrivateProfileFields(
  profile: CandidateProfileData,
  showPrivateFields: boolean,
): CandidateProfileData {
  if (showPrivateFields) {
    return profile;
  }

  return {
    ...profile,
    email: "",
    phone: null,
    documents: [],
  };
}
