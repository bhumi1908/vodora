export type OwnRecruiterProfileUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  email_verified_at: string | null;
};

export type OwnRecruiterProfileRecruiter = {
  id: string;
  job_title: string | null;
  bio: string | null;
  recruiter_type: string | null;
};

export type OwnRecruiterProfileCompany = {
  id: string;
  name: string;
  website: string | null;
  city: string | null;
  country: string | null;
  is_verified: boolean;
};

export type OwnRecruiterProfileRpcResult = {
  user: OwnRecruiterProfileUser;
  recruiter: OwnRecruiterProfileRecruiter | null;
  company: OwnRecruiterProfileCompany | null;
};
