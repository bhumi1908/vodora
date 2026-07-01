export type RecruiterJobStats = {
  totalPlacements: number;
  activeRoles: number;
  candidatesWorkedWith: number;
  avgTimeToHireDays: number | null;
  hiringFasterPercent: number | null;
  hoursSavedThisMonth: number;
};

export type RecruiterDashboardRecentApplicant = {
  applicationId: string;
  name: string;
  avatarInitials: string;
  profilePictureUrl: string | null;
  verifiedReferenceCount: number;
};

export type RecruiterJobListItem = {
  id: string;
  title: string;
  type: string;
  location: string;
  salary: string;
  applicants: number;
  posted: string;
  urgent: boolean;
  status: string;
  newApplicantCount: number;
  recentNewApplicants: RecruiterDashboardRecentApplicant[];
};

export type WorkTypeOption = {
  id: string;
  code: string;
  name: string;
};

export type CreateJobPostingPayload = {
  title: string;
  companyDisplayName: string;
  category: string;
  location: string;
  workTypeId: string;
  salaryDisplay: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  isUrgent: boolean;
  publish: boolean;
};

export type CreateJobPostingFieldErrors = Partial<
  Record<
    | "title"
    | "companyDisplayName"
    | "category"
    | "location"
    | "workTypeId"
    | "description",
    string
  >
>;

export type RecruiterJobDetail = {
  id: string;
  title: string;
  companyDisplayName: string;
  category: string;
  location: string;
  workTypeId: string;
  salaryDisplay: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  isUrgent: boolean;
  status: string;
};

export type UpdateJobPostingPayload = CreateJobPostingPayload;
