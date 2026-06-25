import type { ProfileConnectionState } from "@/lib/connections/connection.types";
import type { CandidateProfileData } from "@/lib/profile/types";

export type ProfileTabId = "references" | "documents" | "jobs";

const OWNER_TABS: ProfileTabId[] = ["references", "documents", "jobs"];
const CONNECTED_EXTERNAL_TABS: ProfileTabId[] = ["references", "documents"];
const LOCKED_PREVIEW_TABS: ProfileTabId[] = ["references", "documents", "jobs"];

export type ProfileVisibilityOptions = {
  isOwnProfile?: boolean;
  visitorPreview?: boolean;
  recruiterView?: boolean;
  peerView?: boolean;
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
  showLockedPrivateTabs: boolean;
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
  const peerView = options.peerView ?? false;
  const hasReferenceAccess = options.hasReferenceAccess ?? false;
  const connected = isConnected(options.connection ?? null);

  const isOwnerView = isOwnProfile && !visitorPreview;
  const isExternalView = recruiterView || peerView;
  const isBasicExternalView = visitorPreview || (isExternalView && !connected);
  const isConnectedExternalView = isExternalView && connected;

  const showPrivateDetails = isOwnerView || isConnectedExternalView;

  let visibleTabIds: ProfileTabId[] = [];
  let showLockedPrivateTabs = false;

  if (isOwnerView) {
    visibleTabIds = OWNER_TABS;
  } else if (visitorPreview) {
    showLockedPrivateTabs = true;
    visibleTabIds = LOCKED_PREVIEW_TABS;
  } else if (isBasicExternalView) {
    showLockedPrivateTabs = true;
    visibleTabIds = LOCKED_PREVIEW_TABS;
  } else if (isConnectedExternalView) {
    visibleTabIds = hasReferenceAccess
      ? CONNECTED_EXTERNAL_TABS
      : CONNECTED_EXTERNAL_TABS.filter((tabId) => tabId !== "references");
  }

  return {
    showContactDetails: showPrivateDetails,
    showAvailability: showPrivateDetails,
    showVodoraId: isOwnerView,
    showOwnerActions: isOwnerView,
    showVisitorBanner: visitorPreview,
    showRestrictedNotice: isBasicExternalView,
    showConnectInHeader: isExternalView && !visitorPreview,
    showConnectPreview: isBasicExternalView && !visitorPreview,
    showLockedPrivateTabs,
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
