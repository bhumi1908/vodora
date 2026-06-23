"use client";

import {
  FormSelect,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import type { QuestionnaireAnswers } from "@/lib/references/reference-questionnaire";
import {
  REFERENCE_QUESTIONNAIRE,
  REFERENCE_RATING_OPTIONS,
} from "@/lib/references/reference-questionnaire";

type ReferenceQuestionnaireFieldsProps = {
  answers: QuestionnaireAnswers;
  errors: Partial<Record<string, string>>;
  onAnswerChange: (questionId: string, value: string) => void;
};

export function ReferenceQuestionnaireFields({
  answers,
  errors,
  onAnswerChange,
}: ReferenceQuestionnaireFieldsProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-900">Structured questionnaire</p>
      {REFERENCE_QUESTIONNAIRE.map((question) => {
        const error = errors[question.id];

        if (question.type === "textarea") {
          return (
            <FormTextarea
              key={question.id}
              id={`questionnaire-${question.id}`}
              label={question.label}
              required={question.required}
              value={answers[question.id]}
              onChange={(event) => onAnswerChange(question.id, event.target.value)}
              placeholder={question.placeholder}
              rows={4}
              error={error}
            />
          );
        }

        if (question.type === "rating") {
          return (
            <FormSelect
              key={question.id}
              id={`questionnaire-${question.id}`}
              label={question.label}
              required={question.required}
              value={answers[question.id]}
              onChange={(event) => onAnswerChange(question.id, event.target.value)}
              placeholder="Select rating"
              options={[...REFERENCE_RATING_OPTIONS]}
              error={error}
            />
          );
        }

        return (
          <FormSelect
            key={question.id}
            id={`questionnaire-${question.id}`}
            label={question.label}
            required={question.required}
            value={answers[question.id]}
            onChange={(event) => onAnswerChange(question.id, event.target.value)}
            placeholder="Select an option"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            error={error}
          />
        );
      })}
    </div>
  );
}
