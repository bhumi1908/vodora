export type ReferenceRequestEmailParams = {
  referenceRequestId: string;
  inviteUrl: string;
  candidateName: string;
  refereeName: string;
  refereeEmail: string;
  refereeCompany: string;
  relationshipLabel: string;
  message?: string | null;
  recruiterName?: string | null;
  recruiterCompany?: string | null;
};

export type DeliverReferenceInvitationParams = ReferenceRequestEmailParams & {
  recruiterEmail?: string | null;
  historyUrl?: string | null;
};
