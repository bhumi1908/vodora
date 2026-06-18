import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiResult } from "@/lib/query/profile-mutations.types";
import { profileKeys } from "@/lib/query/keys";
import {
  deleteProfileDocument,
  saveEducationSection,
  saveExperienceSection,
  saveOverviewSection,
  saveSkillsSection,
  uploadProfileDocument,
  uploadProfilePhoto,
} from "@/components/profile/edit/profile-edit-api";

function useProfileMutation<TVariables, TData = ApiResult>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.own() });
    },
  });
}

export function useSaveOverviewMutation() {
  return useProfileMutation(saveOverviewSection);
}

export function useSaveExperienceMutation() {
  return useProfileMutation(saveExperienceSection);
}

export function useSaveEducationMutation() {
  return useProfileMutation(saveEducationSection);
}

export function useSaveSkillsMutation() {
  return useProfileMutation(saveSkillsSection);
}

export function useUploadProfilePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: (data) => {
      if (data.success) {
        void queryClient.invalidateQueries({ queryKey: profileKeys.own() });
      }
    },
  });
}

export function useUploadProfileDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      documentType,
      isPrimary,
    }: {
      file: File;
      documentType: string;
      isPrimary: boolean;
    }) => uploadProfileDocument(file, documentType, isPrimary),
    onSuccess: (data) => {
      if (data.success) {
        void queryClient.invalidateQueries({ queryKey: profileKeys.own() });
      }
    },
  });
}

export function useDeleteProfileDocumentMutation() {
  return useProfileMutation(deleteProfileDocument);
}
