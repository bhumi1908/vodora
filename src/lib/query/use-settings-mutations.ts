import { useMutation } from "@tanstack/react-query";

import {
  saveCandidateVisibility,
  saveDefaultCoverLetter,
  saveRememberMePreference,
} from "@/components/settings/settings-api";
import type { CandidateVisibility } from "@/lib/settings/candidate-visibility";

export function useSaveCandidateVisibilityMutation() {
  return useMutation({
    mutationFn: (visibility: CandidateVisibility) =>
      saveCandidateVisibility(visibility),
  });
}

export function useSaveDefaultCoverLetterMutation() {
  return useMutation({
    mutationFn: (defaultCoverLetter: string) =>
      saveDefaultCoverLetter(defaultCoverLetter),
  });
}

export function useSaveRememberMeMutation() {
  return useMutation({
    mutationFn: (rememberMe: boolean) => saveRememberMePreference(rememberMe),
  });
}
