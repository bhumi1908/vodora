export const REFERENCE_RATING_OPTIONS = [
  { value: "1", label: "1 - Poor" },
  { value: "2", label: "2 - Below average" },
  { value: "3", label: "3 - Average" },
  { value: "4", label: "4 - Good" },
  { value: "5", label: "5 - Excellent" },
] as const;

export const REFERENCE_QUESTIONNAIRE = [
  {
    id: "strengths",
    label: "What are this candidate's key strengths?",
    type: "textarea",
    required: true,
    placeholder: "Describe their strongest professional qualities...",
  },
  {
    id: "areas_for_improvement",
    label: "What areas could the candidate improve?",
    type: "textarea",
    required: true,
    placeholder: "Share constructive areas for growth...",
  },
  {
    id: "job_performance",
    label: "Overall job performance",
    type: "rating",
    required: true,
  },
  {
    id: "reliability",
    label: "Reliability and dependability",
    type: "rating",
    required: true,
  },
  {
    id: "teamwork",
    label: "Teamwork and collaboration",
    type: "rating",
    required: true,
  },
  {
    id: "communication",
    label: "Communication skills",
    type: "rating",
    required: true,
  },
  {
    id: "leadership",
    label: "Leadership potential",
    type: "rating",
    required: true,
  },
  {
    id: "would_rehire",
    label: "Would you rehire or recommend this candidate?",
    type: "yes_no",
    required: true,
  },
  {
    id: "additional_comments",
    label: "Additional comments",
    type: "textarea",
    required: false,
    placeholder: "Any other feedback you would like to share...",
  },
] as const;

export type QuestionnaireQuestionId =
  (typeof REFERENCE_QUESTIONNAIRE)[number]["id"];

export type QuestionnaireAnswers = Record<QuestionnaireQuestionId, string>;

export function createEmptyQuestionnaireAnswers(): QuestionnaireAnswers {
  return REFERENCE_QUESTIONNAIRE.reduce((answers, question) => {
    answers[question.id] = "";
    return answers;
  }, {} as QuestionnaireAnswers);
}

export function formatQuestionnaireAnswerValue(
  question: (typeof REFERENCE_QUESTIONNAIRE)[number],
  value: string,
): string {
  if (!value) {
    return "";
  }

  if (question.type === "rating") {
    const option = REFERENCE_RATING_OPTIONS.find((entry) => entry.value === value);
    return option?.label ?? value;
  }

  if (question.type === "yes_no") {
    return value === "yes" ? "Yes" : value === "no" ? "No" : value;
  }

  return value;
}
