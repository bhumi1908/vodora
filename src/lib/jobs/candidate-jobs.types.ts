export type JobRecruiter = {
  name: string;
  title: string;
  company: string;
  avatar: string;
  profilePictureUrl: string | null;
  verified: boolean;
};

export type CandidateJob = {
  id: string;
  title: string;
  company: string;
  category: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  postedDate: string;
  urgent: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  recruiter: JobRecruiter;
};

export type JobApplicationStatus =
  | "Applied"
  | "Shortlisted"
  | "Interview"
  | "Offer"
  | "Unsuccessful";

export type CandidateJobFilters = {
  category: string;
  workTypes: string[];
  location: string;
  query: string;
};
