import type {
  CreateReferenceSharePayload,
  CreateReferenceRecruiterGrantPayload,
  OpenReferenceShareLinkResult,
  ReferencePassportShareItem,
  ReferenceRecruiterGrantItem,
  ConnectedRecruiterShareOption,
} from "@/lib/references/reference-passport-share.types";

type SharesResponse = {
  success: boolean;
  error?: string;
  shares?: ReferencePassportShareItem[];
};

type CreateShareResponse = {
  success: boolean;
  error?: string;
  share?: ReferencePassportShareItem;
};

type OpenShareResponse = {
  success: boolean;
  error?: string;
  data?: OpenReferenceShareLinkResult;
};

export async function fetchReferencePassportShares(): Promise<
  ReferencePassportShareItem[]
> {
  const response = await fetch("/api/candidate/references/shares");
  const result = (await response.json()) as SharesResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Unable to load share links.");
  }

  return result.shares ?? [];
}

export async function createReferencePassportShare(
  payload: CreateReferenceSharePayload,
): Promise<ReferencePassportShareItem> {
  const response = await fetch("/api/candidate/references/shares", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as CreateShareResponse;

  if (!response.ok || !result.success || !result.share) {
    throw new Error(result.error ?? "Unable to create share link.");
  }

  return result.share;
}

export async function revokeReferencePassportShare(shareId: string): Promise<void> {
  const response = await fetch(
    `/api/candidate/references/shares?id=${encodeURIComponent(shareId)}`,
    { method: "DELETE" },
  );
  const result = (await response.json()) as { success: boolean; error?: string };

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Unable to revoke share link.");
  }
}

export async function openReferenceShareLink(
  token: string,
): Promise<OpenReferenceShareLinkResult> {
  const response = await fetch(`/api/share/${encodeURIComponent(token)}`);
  const result = (await response.json()) as OpenShareResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error ?? "Unable to open share link.");
  }

  return result.data;
}

type GrantsResponse = {
  success: boolean;
  error?: string;
  grants?: ReferenceRecruiterGrantItem[];
  connectedRecruiters?: ConnectedRecruiterShareOption[];
};

type CreateGrantResponse = {
  success: boolean;
  error?: string;
  grant?: ReferenceRecruiterGrantItem;
};

export async function fetchReferenceShareGrants(): Promise<{
  grants: ReferenceRecruiterGrantItem[];
  connectedRecruiters: ConnectedRecruiterShareOption[];
}> {
  const response = await fetch("/api/candidate/references/grants");
  const result = (await response.json()) as GrantsResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Unable to load recruiter access.");
  }

  return {
    grants: result.grants ?? [],
    connectedRecruiters: result.connectedRecruiters ?? [],
  };
}

export async function createReferenceRecruiterGrant(
  payload: CreateReferenceRecruiterGrantPayload,
): Promise<ReferenceRecruiterGrantItem> {
  const response = await fetch("/api/candidate/references/grants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as CreateGrantResponse;

  if (!response.ok || !result.success || !result.grant) {
    throw new Error(result.error ?? "Unable to share with recruiter.");
  }

  return result.grant;
}

export async function revokeReferenceRecruiterGrant(grantId: string): Promise<void> {
  const response = await fetch(
    `/api/candidate/references/grants?id=${encodeURIComponent(grantId)}`,
    { method: "DELETE" },
  );
  const result = (await response.json()) as { success: boolean; error?: string };

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Unable to revoke recruiter access.");
  }
}
