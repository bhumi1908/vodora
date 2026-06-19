import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createCompanyInvitation,
  saveRecruiterAboutSection,
  saveRecruiterCompanySection,
  saveRecruiterDetailsSection,
  saveRecruiterHiringPreferencesSection,
  uploadRecruiterProfilePhoto,
} from "@/components/recruiter/edit/recruiter-profile-edit-api";
import { recruiterKeys } from "@/lib/query/keys";

type ApiResult = {
  success: boolean;
  error?: string;
};

function useRecruiterProfileMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResult>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      if (result.success) {
        void queryClient.invalidateQueries({ queryKey: recruiterKeys.ownProfile() });
      }
    },
  });
}

export function useSaveRecruiterDetailsMutation() {
  return useRecruiterProfileMutation(saveRecruiterDetailsSection);
}

export function useSaveRecruiterCompanyMutation() {
  return useRecruiterProfileMutation(saveRecruiterCompanySection);
}

export function useSaveRecruiterAboutMutation() {
  return useRecruiterProfileMutation(saveRecruiterAboutSection);
}

export function useSaveRecruiterHiringPreferencesMutation() {
  return useRecruiterProfileMutation(saveRecruiterHiringPreferencesSection);
}

export function useUploadRecruiterProfilePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadRecruiterProfilePhoto,
    onSuccess: (data) => {
      if (data.success) {
        void queryClient.invalidateQueries({ queryKey: recruiterKeys.ownProfile() });
      }
    },
  });
}

export function useCreateCompanyInvitationMutation() {
  return useMutation({
    mutationFn: createCompanyInvitation,
  });
}
