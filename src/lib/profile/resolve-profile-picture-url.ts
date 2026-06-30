type ProfilePhotoDocument = {
  document_type: string;
  file_url: string;
  is_primary: boolean;
};

export function resolveProfilePictureUrl(
  profilePictureUrl: string | null | undefined,
  documents: ProfilePhotoDocument[] = [],
): string | null {
  if (profilePictureUrl) {
    return profilePictureUrl;
  }

  const photos = documents.filter(
    (document) => document.document_type === "profile_photo",
  );

  if (photos.length === 0) {
    return null;
  }

  return photos.find((document) => document.is_primary)?.file_url ?? photos[0].file_url;
}
