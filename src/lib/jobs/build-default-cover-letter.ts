export function buildDefaultCoverLetter(params: {
  recruiterName: string;
  jobTitle: string;
  company: string;
  candidateName: string;
}): string {
  const greeting = params.recruiterName.trim()
    ? `Dear ${params.recruiterName.trim()},`
    : "Dear Hiring Manager,";

  return `${greeting}

I am writing to express my strong interest in the ${params.jobTitle} position at ${params.company}. With my background on Vodora, I am confident I would be a valuable addition to your team.

I look forward to discussing this opportunity further.

Kind regards,
${params.candidateName.trim() || "Candidate"}`;
}
