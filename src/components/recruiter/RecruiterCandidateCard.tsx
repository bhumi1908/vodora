"use client";

import type { RecruiterDashboardCandidate } from "@/lib/recruiter/dashboard.types";

import { RecruiterCandidateListCard } from "@/components/recruiter/RecruiterCandidateListCard";

type RecruiterCandidateCardProps = {
  candidate: RecruiterDashboardCandidate;
};

export function RecruiterCandidateCard({ candidate }: RecruiterCandidateCardProps) {
  return <RecruiterCandidateListCard candidate={candidate} />;
}
