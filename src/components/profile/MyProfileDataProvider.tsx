"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import type { OwnCandidateProfileRpcResult } from "@/lib/profile/own-candidate-profile-rpc.types";
import { profileKeys } from "@/lib/query/keys";
import { fetchOwnCandidateProfile } from "@/lib/query/profile-fetchers";

type MyProfileDataContextValue = {
  rawProfile: OwnCandidateProfileRpcResult;
};

const MyProfileDataContext = createContext<MyProfileDataContextValue | null>(
  null,
);

type MyProfileDataProviderProps = {
  rawProfile: OwnCandidateProfileRpcResult;
  children: ReactNode;
};

export function MyProfileDataProvider({
  rawProfile: initialProfile,
  children,
}: MyProfileDataProviderProps) {
  const { data: profile = initialProfile } = useQuery({
    queryKey: profileKeys.own(),
    queryFn: fetchOwnCandidateProfile,
    initialData: initialProfile,
  });

  const value = useMemo(() => ({ rawProfile: profile }), [profile]);

  return (
    <MyProfileDataContext.Provider value={value}>
      {children}
    </MyProfileDataContext.Provider>
  );
}

export function useMyProfileData(): OwnCandidateProfileRpcResult | null {
  return useContext(MyProfileDataContext)?.rawProfile ?? null;
}

export function useRequiredMyProfileData(): OwnCandidateProfileRpcResult {
  const rawProfile = useMyProfileData();

  if (!rawProfile) {
    throw new Error("MyProfileDataProvider is required for this page.");
  }

  return rawProfile;
}

export function useInvalidateOwnProfile() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({ queryKey: profileKeys.own() });
}
