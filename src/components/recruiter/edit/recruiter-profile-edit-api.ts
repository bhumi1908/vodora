type ApiResult = {
  success: boolean;
  error?: string;
};

async function parseApiResult(response: Response): Promise<ApiResult> {
  const data = (await response.json()) as ApiResult;

  if (!response.ok || !data.success) {
    return {
      success: false,
      error: data.error ?? "Something went wrong. Please try again.",
    };
  }

  return { success: true };
}

export async function saveRecruiterDetailsSection(payload: {
  title: string;
  phone: string;
  city: string;
  country: string;
}): Promise<ApiResult> {
  const response = await fetch("/api/recruiter/profile/details", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseApiResult(response);
}

export async function saveRecruiterCompanySection(payload: {
  companyName: string;
  website: string;
  city: string;
  country: string;
  employeeCount: string;
  hiresPerYear: string;
  recruiterType: string;
}): Promise<ApiResult> {
  const response = await fetch("/api/recruiter/profile/company", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseApiResult(response);
}

export async function saveRecruiterAboutSection(payload: {
  bio: string;
  specialisations: string[];
  industries: string[];
}): Promise<ApiResult> {
  const response = await fetch("/api/recruiter/profile/about", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseApiResult(response);
}

export async function saveRecruiterHiringPreferencesSection(payload: {
  preferredWorkTypeCodes: string[];
  preferredExperienceLevels: string[];
  remotePreference: string;
}): Promise<ApiResult> {
  const response = await fetch("/api/recruiter/profile/hiring-preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseApiResult(response);
}

export async function uploadRecruiterProfilePhoto(file: File): Promise<
  | { success: true; profilePictureUrl: string }
  | { success: false; error: string }
> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/recruiter/profile/photo", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as {
    success: boolean;
    error?: string;
    profilePictureUrl?: string;
  };

  if (!response.ok || !data.success || !data.profilePictureUrl) {
    return {
      success: false,
      error: data.error ?? "Failed to upload photo.",
    };
  }

  return {
    success: true,
    profilePictureUrl: data.profilePictureUrl,
  };
}

export async function createCompanyInvitation(payload: {
  email: string;
  teamRole: string;
}): Promise<
  | {
      success: true;
      invitation: {
        id: string;
        email: string;
        teamRole: string;
        status: string;
        createdAt: string;
        expiresAt: string;
      };
    }
  | { success: false; error: string }
> {
  const response = await fetch("/api/recruiter/invitations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as {
    success: boolean;
    error?: string;
    invitation?: {
      id: string;
      email: string;
      teamRole: string;
      status: string;
      createdAt: string;
      expiresAt: string;
    };
  };

  if (!response.ok || !data.success || !data.invitation) {
    return {
      success: false,
      error: data.error ?? "Could not save invitation.",
    };
  }

  return {
    success: true,
    invitation: data.invitation,
  };
}

export async function fetchCompanyInvitations(): Promise<
  Array<{
    id: string;
    email: string;
    teamRole: string;
    status: string;
    createdAt: string;
    expiresAt: string;
  }>
> {
  const response = await fetch("/api/recruiter/invitations");
  const data = (await response.json()) as {
    success: boolean;
    invitations?: Array<{
      id: string;
      email: string;
      teamRole: string;
      status: string;
      createdAt: string;
      expiresAt: string;
    }>;
    error?: string;
  };

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Could not load invitations.");
  }

  return data.invitations ?? [];
}
