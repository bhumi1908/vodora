export type ReferencePassportShareItem = {
  id: string;
  shareToken: string;
  shareType: "full_passport" | "selected_references";
  includedReferenceIds: string[];
  permissions: import("@/lib/references/reference-permissions").ReferenceSharePermissions;
  isActive: boolean;
  expiresAt: string | null;
  viewCount: number;
  createdAt: string;
  shareUrl: string;
};

export type ReferenceRecruiterGrantItem = {
  id: string;
  recruiterId: string;
  recruiterName: string;
  recruiterCompany: string | null;
  shareType: "full_passport" | "selected_references";
  includedReferenceIds: string[];
  permissions: import("@/lib/references/reference-permissions").ReferenceSharePermissions;
  grantSource: "job_application" | "manual" | "connection";
  createdAt: string;
  revokedAt: string | null;
};

export type ConnectedRecruiterShareOption = {
  recruiterId: string;
  name: string;
  company: string;
  title: string;
  profilePictureUrl: string | null;
};

export type ReferenceShareCandidateSummary = {
  id: string;
  vodoraId: string | null;
  name: string;
  title: string | null;
  city: string | null;
  country: string | null;
  profilePictureUrl: string | null;
};

export type OpenReferenceShareLinkResult = {
  shareId: string;
  shareType: "full_passport" | "selected_references";
  viewCount: number;
  permissions: import("@/lib/references/reference-permissions").ReferenceSharePermissions;
  candidate: ReferenceShareCandidateSummary;
  references: import("@/lib/references/fetch-candidate-references").CandidateReferenceItem[];
};

export type CreateReferenceSharePayload = {
  shareType?: "full_passport" | "selected_references";
  includedReferenceIds?: string[];
  permissions?: Partial<
    import("@/lib/references/reference-permissions").ReferenceSharePermissions
  >;
  expiresInDays?: number | null;
};

export type CreateReferenceRecruiterGrantPayload = {
  recruiterId: string;
  shareType?: "full_passport" | "selected_references";
  includedReferenceIds?: string[];
  permissions?: Partial<
    import("@/lib/references/reference-permissions").ReferenceSharePermissions
  >;
};

export type SendReferenceShareLinkToRecruiterPayload =
  CreateReferenceRecruiterGrantPayload & {
    expiresInDays?: number | null;
  };
