import type { CandidateProfileEditData, ProfileSectionId } from "@/components/profile/edit/types";
import type { CandidateProfileData } from "@/lib/profile/types";
import type { RecruiterProfileEditData } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";

export type RecruiterProfileSectionId =
  | "photo"
  | "details"
  | "company"
  | "about"
  | "preferences";

export const CANDIDATE_SECTION_COPY: Record<
  ProfileSectionId,
  { title: string; description: string; label: string }
> = {
  photo: {
    title: "Profile Photo",
    description: "Add a professional photo so recruiters can recognize you.",
    label: "Photo",
  },
  overview: {
    title: "Overview",
    description:
      "Your headline, contact details, availability, and professional summary.",
    label: "Overview",
  },
  experience: {
    title: "Experience",
    description: "Add your employment history and key responsibilities.",
    label: "Experience",
  },
  education: {
    title: "Education",
    description: "Add your degrees, schools, and academic background.",
    label: "Education",
  },
  skills: {
    title: "Skills",
    description:
      "Highlight technical and professional skills recruiters should know about.",
    label: "Skills",
  },
  documents: {
    title: "Documents",
    description: "Upload your resume and supporting documents.",
    label: "Documents",
  },
};

export const RECRUITER_SECTION_COPY: Record<
  RecruiterProfileSectionId,
  { title: string; description: string; label: string }
> = {
  photo: {
    title: "Profile Photo",
    description: "Add a professional photo so candidates can recognize you.",
    label: "Photo",
  },
  details: {
    title: "Contact Details",
    description: "Your role, phone number, and location.",
    label: "Details",
  },
  company: {
    title: "Company Information",
    description:
      "Details about your company. These appear on your public profile.",
    label: "Company",
  },
  about: {
    title: "About",
    description: "Your bio, specialisations, and industries you recruit for.",
    label: "About",
  },
  preferences: {
    title: "Hiring Preferences",
    description: "Tell us what kind of candidates you typically hire for.",
    label: "Preferences",
  },
};

export function candidateSectionHasContent(
  sectionId: ProfileSectionId,
  profile: CandidateProfileData | CandidateProfileEditData,
): boolean {
  switch (sectionId) {
    case "photo":
      return Boolean(profile.profilePictureUrl);
    case "overview": {
      const about = profile.about?.trim();
      const title =
        "title" in profile && typeof profile.title === "string"
          ? profile.title.trim()
          : (profile.title ?? "").toString().trim();
      const company =
        "company" in profile && typeof profile.company === "string"
          ? profile.company.trim()
          : (profile.company ?? "").toString().trim();
      const phone = profile.phone?.trim();
      const website = profile.website?.trim();
      const location =
        "location" in profile ? profile.location?.trim() : undefined;
      const city =
        "city" in profile ? profile.city?.trim() : undefined;
      const country =
        "country" in profile ? profile.country?.trim() : undefined;

      return Boolean(
        about ||
          title ||
          company ||
          phone ||
          website ||
          location ||
          city ||
          country,
      );
    }
    case "experience":
      return profile.experience.length > 0;
    case "education":
      return profile.education.length > 0;
    case "skills":
      return profile.skills.length > 0;
    case "documents":
      return profile.documents.length > 0;
    default:
      return false;
  }
}

export function recruiterSectionHasContent(
  sectionId: RecruiterProfileSectionId,
  profile: RecruiterProfileEditData,
): boolean {
  switch (sectionId) {
    case "photo":
      return Boolean(profile.profilePictureUrl);
    case "details":
      return Boolean(
        profile.title?.trim() ||
          profile.phone?.trim() ||
          profile.city?.trim() ||
          profile.country?.trim(),
      );
    case "company":
      return Boolean(
        profile.companyName?.trim() ||
          profile.website?.trim() ||
          profile.employeeCount?.trim() ||
          profile.hiresPerYear?.trim() ||
          profile.recruiterType?.trim(),
      );
    case "about":
      return Boolean(
        profile.bio?.trim() ||
          profile.specialisations.length > 0 ||
          profile.industries.length > 0,
      );
    case "preferences":
      return Boolean(
        profile.preferredWorkTypeCodes.length > 0 ||
          profile.preferredExperienceLevels.length > 0 ||
          profile.remotePreference?.trim(),
      );
    default:
      return false;
  }
}
