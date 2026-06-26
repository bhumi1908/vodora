import type {
  ConnectionStatus,
  ProfileConnectionState,
} from "@/lib/connections/connection.types";
import type { RecruiterDirectoryActiveRole } from "@/lib/recruiter/recruiter-directory.types";
import type { RecruiterProfileData } from "@/lib/recruiter/recruiter-profile.types";

export type CandidateRecruiterProfileStats = {
  totalPlacements: number;
  activeRoles: number;
  candidatesWorkedWith: number;
  avgTimeToHireDays: number | null;
};

export type CandidateRecruiterHiringPreferences = {
  preferredWorkTypeCodes: string[];
  preferredExperienceLevels: string[];
  remotePreference: string | null;
};

export type CandidateRecruiterProfileData = RecruiterProfileData & {
  recruiterId: string;
  hiringPreferences: CandidateRecruiterHiringPreferences;
  stats: CandidateRecruiterProfileStats;
  activeRoles: RecruiterDirectoryActiveRole[];
  connectionStatus: ConnectionStatus | null;
  connection: ProfileConnectionState;
};
