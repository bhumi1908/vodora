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

export async function saveOverviewSection(payload: {
  about: string;
  title: string;
  company: string;
  phone: string;
  website: string;
  city: string;
  country: string;
  availabilityStatus: string;
  availabilityStart: string;
  totalYearsExperience: string;
  experienceLevel: string;
}): Promise<ApiResult> {
  const response = await fetch("/api/profile/overview", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseApiResult(response);
}

export async function saveExperienceSection(
  entries: Array<{
    id: string | null;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }>,
): Promise<ApiResult> {
  const response = await fetch("/api/profile/experience", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });

  return parseApiResult(response);
}

export async function saveEducationSection(
  entries: Array<{
    id: string | null;
    degree: string;
    school: string;
    startDate: string;
    endDate: string;
    description: string;
  }>,
): Promise<ApiResult> {
  const response = await fetch("/api/profile/education", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });

  return parseApiResult(response);
}

export async function saveSkillsSection(
  entries: Array<{
    id: string | null;
    name: string;
    proficiency: string;
    yearsExperience: string;
  }>,
): Promise<ApiResult> {
  const response = await fetch("/api/profile/skills", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });

  return parseApiResult(response);
}

export async function uploadProfilePhoto(file: File): Promise<
  | { success: true; profilePictureUrl: string }
  | { success: false; error: string }
> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/profile/photo", {
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

export async function uploadProfileDocument(
  file: File,
  documentType: string,
  isPrimary: boolean,
): Promise<
  | {
      success: true;
      document: {
        id: string;
        name: string;
        type: string;
        url: string;
        uploadedAt: string;
        isPrimary: boolean;
      };
    }
  | { success: false; error: string }
> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);
  formData.append("isPrimary", String(isPrimary));

  const response = await fetch("/api/profile/documents", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as {
    success: boolean;
    error?: string;
    document?: {
      id: string;
      name: string;
      type: string;
      url: string;
      uploadedAt: string;
      isPrimary: boolean;
    };
  };

  if (!response.ok || !data.success || !data.document) {
    return {
      success: false,
      error: data.error ?? "Failed to upload document.",
    };
  }

  return {
    success: true,
    document: data.document,
  };
}

export async function deleteProfileDocument(
  documentId: string,
): Promise<ApiResult> {
  const response = await fetch("/api/profile/documents", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: documentId }),
  });

  return parseApiResult(response);
}

export async function saveSpotlightSection(
  blocks: Array<{
    id: string;
    type: string;
    text?: string;
    title?: string;
    code?: string;
    language?: string;
    videoUrl?: string;
    videoTitle?: string;
    tags?: string[];
  }>,
): Promise<ApiResult> {
  const response = await fetch("/api/profile/spotlight", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });

  return parseApiResult(response);
}
