"use client";

import {
  FormSelect,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import type { WrittenAssessmentAnswers } from "@/lib/references/written-reference-assessment";
import { WRITTEN_REFERENCE_ASSESSMENT } from "@/lib/references/written-reference-assessment";

type WrittenReferenceAssessmentFieldsProps = {
  answers: WrittenAssessmentAnswers;
  errors: Partial<Record<string, string>>;
  onAnswerChange: (questionId: string, value: string) => void;
};

const SECTION_LABELS: Record<string, string> = {
  professional_assessment: "Professional assessment",
  written_feedback: "Written feedback",
  rehire: "Rehire recommendation",
};

export function WrittenReferenceAssessmentFields({
  answers,
  errors,
  onAnswerChange,
}: WrittenReferenceAssessmentFieldsProps) {
  const sections = [...new Set(WRITTEN_REFERENCE_ASSESSMENT.map((q) => q.section))];

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const questions = WRITTEN_REFERENCE_ASSESSMENT.filter(
          (question) => question.section === section,
        );

        return (
          <div key={section} className="space-y-4">
            <p className="text-sm font-medium text-gray-900">
              {SECTION_LABELS[section] ?? section}
            </p>
            {questions.map((question) => {
              const error = errors[question.id];

              if (question.type === "textarea") {
                return (
                  <FormTextarea
                    key={question.id}
                    id={`written-assessment-${question.id}`}
                    label={question.label}
                    required={question.required}
                    value={answers[question.id]}
                    onChange={(event) =>
                      onAnswerChange(question.id, event.target.value)
                    }
                    placeholder={question.placeholder}
                    rows={4}
                    error={error}
                  />
                );
              }

              return (
                <div key={question.id}>
                  {"description" in question && question.description ? (
                    <p className="mb-2 text-sm text-gray-600">{question.description}</p>
                  ) : null}
                  <FormSelect
                    id={`written-assessment-${question.id}`}
                    label={question.label}
                    required={question.required}
                    value={answers[question.id]}
                    onChange={(event) =>
                      onAnswerChange(question.id, event.target.value)
                    }
                    placeholder="Select an option"
                    options={[...question.options]}
                    error={error}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
