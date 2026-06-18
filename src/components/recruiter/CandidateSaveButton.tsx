"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";

import {
  showCandidateRemovedToast,
  showCandidateSavedToast,
  showCandidateSaveErrorToast,
} from "@/lib/recruiter/candidate-save-toast";
import { recruiterKeys } from "@/lib/query/keys";
import { toggleRecruiterCandidateSave } from "@/lib/query/recruiter-fetchers";

type CandidateSaveButtonProps = {
  candidateId: string;
  initialSaved: boolean;
  candidateName?: string;
  onSavedChange?: (saved: boolean) => void;
  variant?: "list" | "grid";
};

export function CandidateSaveButton({
  candidateId,
  initialSaved,
  candidateName,
  onSavedChange,
  variant = "list",
}: CandidateSaveButtonProps) {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(initialSaved);

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  const mutation = useMutation({
    mutationFn: () => toggleRecruiterCandidateSave(candidateId),
    onMutate: () => {
      const previousSaved = saved;
      const nextSaved = !saved;
      setSaved(nextSaved);
      return { previousSaved };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        setSaved(context.previousSaved);
      }
      showCandidateSaveErrorToast();
    },
    onSuccess: (data) => {
      setSaved(data.saved);
      onSavedChange?.(data.saved);

      if (data.saved) {
        showCandidateSavedToast(candidateName);
      } else {
        showCandidateRemovedToast(candidateName);
      }

      void queryClient.invalidateQueries({ queryKey: recruiterKeys.all });
    },
  });

  const handleToggle = () => {
    if (mutation.isPending) {
      return;
    }

    mutation.mutate();
  };

  const listClassName = saved
    ? "bg-amber-50 text-amber-500"
    : "text-gray-400 hover:bg-gray-100";

  const gridClassName = saved
    ? "text-amber-500"
    : "text-gray-400 hover:text-gray-600";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={mutation.isPending}
      aria-label={saved ? "Remove saved profile" : "Save profile"}
      aria-pressed={saved}
      className={`rounded-lg transition-colors disabled:opacity-60 ${
        variant === "grid" ? `p-1.5 ${gridClassName}` : `p-2 ${listClassName}`
      }`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-amber-500" : ""}`} />
    </button>
  );
}
