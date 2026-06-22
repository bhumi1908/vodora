export type ConnectionStatus = "pending" | "connected";

export type ConnectionInitiator = "candidate" | "recruiter";

export type ConnectionType =
  | "candidate_recruiter"
  | "candidate_candidate"
  | "recruiter_recruiter";

export type ConnectionTab = "received" | "sent" | "connected";

export type ConnectionCounts = {
  pending: number;
  pendingReceived: number;
  pendingSent: number;
  connected: number;
  total: number;
};

export type CandidateConnectionEntry = {
  id: string;
  status: ConnectionStatus;
  connectionType: ConnectionType;
  initiatedBy: ConnectionInitiator;
  message: string | null;
  requestedAt: string;
  connectedAt: string | null;
  recruiterId: string | null;
  peerCandidateId: string | null;
  vodoraId: string | null;
  name: string;
  title: string;
  company: string;
  location: string;
  profilePictureUrl: string | null;
};

export type RecruiterConnectionEntry = {
  id: string;
  status: ConnectionStatus;
  connectionType: ConnectionType;
  initiatedBy: ConnectionInitiator;
  message: string | null;
  requestedAt: string;
  connectedAt: string | null;
  candidateId: string | null;
  peerRecruiterId: string | null;
  vodoraId: string | null;
  name: string;
  title: string;
  company: string | null;
  location: string;
  profilePictureUrl: string | null;
};

export type ConnectionListResult<T> = {
  connections: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  error: string | null;
};

export type ProfileConnectionState = {
  id: string;
  status: ConnectionStatus;
  initiatedBy: ConnectionInitiator;
  connectionType?: ConnectionType;
} | null;
