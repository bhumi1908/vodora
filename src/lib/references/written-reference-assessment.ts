export const WRITTEN_ASSESSMENT_SCALE = {
  performance: [
    { value: "outstanding", label: "Outstanding" },
    { value: "above_expectations", label: "Above Expectations" },
    { value: "meets_expectations", label: "Meets Expectations" },
    { value: "needs_improvement", label: "Needs Improvement" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  reliability: [
    { value: "extremely_reliable", label: "Extremely Reliable" },
    { value: "very_reliable", label: "Very Reliable" },
    { value: "generally_reliable", label: "Generally Reliable" },
    { value: "occasionally_unreliable", label: "Occasionally Unreliable" },
    { value: "frequently_unreliable", label: "Frequently Unreliable" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  punctuality: [
    { value: "excellent", label: "Excellent" },
    { value: "very_good", label: "Very Good" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  professionalism: [
    { value: "exceptional", label: "Exceptional" },
    { value: "very_professional", label: "Very Professional" },
    { value: "professional", label: "Professional" },
    { value: "some_concerns", label: "Some Concerns" },
    { value: "significant_concerns", label: "Significant Concerns" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  communication: [
    { value: "excellent", label: "Excellent" },
    { value: "very_good", label: "Very Good" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  teamwork: [
    { value: "exceptional_team_player", label: "Exceptional Team Player" },
    { value: "strong_team_player", label: "Strong Team Player" },
    { value: "works_well_with_others", label: "Works Well With Others" },
    { value: "some_difficulties", label: "Some Difficulties" },
    { value: "significant_difficulties", label: "Significant Difficulties" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  cultureFit: [
    { value: "exceptional_fit", label: "Exceptional Fit" },
    { value: "strong_fit", label: "Strong Fit" },
    { value: "good_fit", label: "Good Fit" },
    { value: "some_challenges", label: "Some Challenges" },
    { value: "poor_fit", label: "Poor Fit" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  technicalKnowledge: [
    { value: "expert_level", label: "Expert Level" },
    { value: "advanced", label: "Advanced" },
    { value: "competent", label: "Competent" },
    { value: "developing", label: "Developing" },
    { value: "limited", label: "Limited" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  problemSolving: [
    { value: "exceptional", label: "Exceptional" },
    { value: "very_strong", label: "Very Strong" },
    { value: "good", label: "Good" },
    { value: "adequate", label: "Adequate" },
    { value: "needs_improvement", label: "Needs Improvement" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  initiative: [
    { value: "exceptional_initiative", label: "Exceptional Initiative" },
    { value: "frequently_proactive", label: "Frequently Proactive" },
    { value: "usually_proactive", label: "Usually Proactive" },
    { value: "occasionally_proactive", label: "Occasionally Proactive" },
    { value: "rarely_proactive", label: "Rarely Proactive" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  adaptability: [
    { value: "exceptional", label: "Exceptional" },
    { value: "very_good", label: "Very Good" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  leadership: [
    { value: "outstanding_leader", label: "Outstanding Leader" },
    { value: "strong_leadership_potential", label: "Strong Leadership Potential" },
    { value: "good_leadership_potential", label: "Good Leadership Potential" },
    { value: "limited_leadership_experience", label: "Limited Leadership Experience" },
    { value: "not_applicable", label: "Not Applicable" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  improvement: [
    { value: "significant_improvement", label: "Significant Improvement" },
    { value: "moderate_improvement", label: "Moderate Improvement" },
    { value: "some_improvement", label: "Some Improvement" },
    { value: "no_significant_change", label: "No Significant Change" },
    { value: "unable_to_assess", label: "Unable to Assess" },
  ],
  rehire: [
    { value: "without_hesitation", label: "Without Hesitation" },
    { value: "yes", label: "Yes" },
    { value: "probably", label: "Probably" },
    { value: "unsure", label: "Unsure" },
    { value: "probably_not", label: "Probably Not" },
    { value: "no", label: "No" },
  ],
} as const;

export const WRITTEN_REFERENCE_ASSESSMENT = [
  {
    id: "overall_performance",
    section: "professional_assessment",
    label: "Overall performance",
    description: "How would you describe the candidate's overall performance?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.performance,
    required: true,
  },
  {
    id: "reliability_dependability",
    section: "professional_assessment",
    label: "Reliability & dependability",
    description: "How reliable was the candidate?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.reliability,
    required: true,
  },
  {
    id: "punctuality_attendance",
    section: "professional_assessment",
    label: "Punctuality & attendance",
    description: "How would you rate their punctuality and attendance?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.punctuality,
    required: true,
  },
  {
    id: "professionalism",
    section: "professional_assessment",
    label: "Professionalism",
    description: "How professional was the candidate in the workplace?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.professionalism,
    required: true,
  },
  {
    id: "communication_skills",
    section: "professional_assessment",
    label: "Communication skills",
    description: "How effectively did the candidate communicate?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.communication,
    required: true,
  },
  {
    id: "teamwork_collaboration",
    section: "professional_assessment",
    label: "Teamwork & collaboration",
    description: "How well did the candidate work with others?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.teamwork,
    required: true,
  },
  {
    id: "workplace_behaviour_culture_fit",
    section: "professional_assessment",
    label: "Workplace behaviour & culture fit",
    description: "How well did the candidate fit into the workplace culture?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.cultureFit,
    required: true,
  },
  {
    id: "technical_knowledge",
    section: "professional_assessment",
    label: "Technical knowledge / subject matter expertise",
    description: "How would you assess the candidate's knowledge of their role?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.technicalKnowledge,
    required: true,
  },
  {
    id: "problem_solving",
    section: "professional_assessment",
    label: "Problem solving ability",
    description: "How effectively did the candidate solve problems?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.problemSolving,
    required: true,
  },
  {
    id: "initiative_ownership",
    section: "professional_assessment",
    label: "Initiative & ownership",
    description: "How much initiative did the candidate demonstrate?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.initiative,
    required: true,
  },
  {
    id: "adaptability",
    section: "professional_assessment",
    label: "Adaptability",
    description: "How well did the candidate adapt to change?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.adaptability,
    required: true,
  },
  {
    id: "leadership_potential",
    section: "professional_assessment",
    label: "Leadership potential",
    description: "How would you assess the candidate's leadership capability?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.leadership,
    required: true,
  },
  {
    id: "greatest_strengths",
    section: "written_feedback",
    label: "What were the candidate's greatest strengths?",
    type: "textarea",
    required: true,
    placeholder: "Describe the candidate's strongest professional qualities...",
  },
  {
    id: "improvement_during_employment",
    section: "written_feedback",
    label: "Did the candidate improve during the time you worked together?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.improvement,
    required: true,
  },
  {
    id: "rehire_recommendation",
    section: "rehire",
    label: "Would you hire this candidate again?",
    type: "select",
    options: WRITTEN_ASSESSMENT_SCALE.rehire,
    required: true,
  },
] as const;

export type WrittenAssessmentQuestionId =
  (typeof WRITTEN_REFERENCE_ASSESSMENT)[number]["id"];

export type WrittenAssessmentAnswers = Record<WrittenAssessmentQuestionId, string>;

/** Key fields shown in the recruiter trust snapshot summary. */
export const WRITTEN_REFERENCE_SUMMARY_FIELDS: {
  id: WrittenAssessmentQuestionId;
  label: string;
}[] = [
  { id: "reliability_dependability", label: "Reliability" },
  { id: "professionalism", label: "Professionalism" },
  { id: "communication_skills", label: "Communication" },
  { id: "teamwork_collaboration", label: "Teamwork" },
  { id: "workplace_behaviour_culture_fit", label: "Culture fit" },
  { id: "technical_knowledge", label: "Subject matter expertise" },
  { id: "leadership_potential", label: "Leadership potential" },
  { id: "rehire_recommendation", label: "Rehire status" },
];

export function createEmptyWrittenAssessmentAnswers(): WrittenAssessmentAnswers {
  return WRITTEN_REFERENCE_ASSESSMENT.reduce((answers, question) => {
    answers[question.id] = "";
    return answers;
  }, {} as WrittenAssessmentAnswers);
}

export function getWrittenAssessmentQuestion(
  id: WrittenAssessmentQuestionId,
): (typeof WRITTEN_REFERENCE_ASSESSMENT)[number] | undefined {
  return WRITTEN_REFERENCE_ASSESSMENT.find((question) => question.id === id);
}

export function formatWrittenAssessmentAnswerValue(
  question: (typeof WRITTEN_REFERENCE_ASSESSMENT)[number],
  value: string,
): string {
  if (!value) {
    return "";
  }

  if (question.type === "select") {
    const option = question.options.find((entry) => entry.value === value);
    return option?.label ?? value;
  }

  return value;
}

const PERFORMANCE_NUMERIC_MAP: Record<string, number | null> = {
  outstanding: 5,
  above_expectations: 4,
  meets_expectations: 3,
  needs_improvement: 2,
  unable_to_assess: null,
};

const RELIABILITY_NUMERIC_MAP: Record<string, number | null> = {
  extremely_reliable: 5,
  very_reliable: 4,
  generally_reliable: 3,
  occasionally_unreliable: 2,
  frequently_unreliable: 1,
  unable_to_assess: null,
};

const TEAMWORK_NUMERIC_MAP: Record<string, number | null> = {
  exceptional_team_player: 5,
  strong_team_player: 4,
  works_well_with_others: 3,
  some_difficulties: 2,
  significant_difficulties: 1,
  unable_to_assess: null,
};

const LEADERSHIP_NUMERIC_MAP: Record<string, number | null> = {
  outstanding_leader: 5,
  strong_leadership_potential: 4,
  good_leadership_potential: 3,
  limited_leadership_experience: 2,
  not_applicable: null,
  unable_to_assess: null,
};

export function mapWrittenAssessmentToLegacyRatings(
  answers: WrittenAssessmentAnswers,
): {
  performanceRating: number | null;
  reliabilityRating: number | null;
  teamworkRating: number | null;
  leadershipRating: number | null;
  rehireRecommendation: boolean | null;
} {
  const performanceRating =
    PERFORMANCE_NUMERIC_MAP[answers.overall_performance] ?? null;
  const reliabilityRating =
    RELIABILITY_NUMERIC_MAP[answers.reliability_dependability] ?? null;
  const teamworkRating =
    TEAMWORK_NUMERIC_MAP[answers.teamwork_collaboration] ?? null;
  const leadershipRating =
    LEADERSHIP_NUMERIC_MAP[answers.leadership_potential] ?? null;

  const rehire = answers.rehire_recommendation;
  const rehireRecommendation =
    rehire === "without_hesitation" ||
    rehire === "yes" ||
    rehire === "probably"
      ? true
      : rehire === "probably_not" || rehire === "no"
        ? false
        : rehire === "unsure"
          ? null
          : null;

  return {
    performanceRating,
    reliabilityRating,
    teamworkRating,
    leadershipRating,
    rehireRecommendation,
  };
}

export function isWrittenAssessmentAnswers(
  value: unknown,
): value is WrittenAssessmentAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return "overall_performance" in value || "greatest_strengths" in value;
}
