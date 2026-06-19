export type RecruiterProfileData = {
  userId: string;
  recruiterId: string | null;
  name: string;
  title: string | null;
  company: string | null;
  location: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  avatarInitials: string;
  bio: string | null;
  verified: boolean;
};
