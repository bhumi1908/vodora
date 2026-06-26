export type RecruiterReferenceCollectionCandidateInput = {
  name: string;
  title: string;
  company: string;
  email: string;
};

export type ResolveReferenceCollectionCandidateResult =
  | {
      success: true;
      candidateId: string;
      candidateName: string;
      isNewInvite: boolean;
      isInvitedStub: boolean;
    }
  | {
      success: false;
      error: string;
    };
