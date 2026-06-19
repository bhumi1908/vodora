"use client";

import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import type { OwnRecruiterProfileRpcResult } from "@/lib/recruiter/own-recruiter-profile-rpc.types";
import { recruiterKeys } from "@/lib/query/keys";
import { fetchRecruiterOwnProfile } from "@/lib/query/recruiter-fetchers";

type MyRecruiterProfileDataContextValue = {
  rawProfile: OwnRecruiterProfileRpcResult;
  isLoading: boolean;
};

const MyRecruiterProfileDataContext =
  createContext<MyRecruiterProfileDataContextValue | null>(null);

type MyRecruiterProfileDataProviderProps = {
  rawProfile: OwnRecruiterProfileRpcResult;
  children: ReactNode;
};

export function MyRecruiterProfileDataProvider({
  rawProfile: initialProfile,
  children,
}: MyRecruiterProfileDataProviderProps) {
  const { data: profile = initialProfile, isPending } = useQuery({
    queryKey: recruiterKeys.ownProfile(),
    queryFn: fetchRecruiterOwnProfile,
    initialData: initialProfile,
  });

  const value = useMemo(
    () => ({
      rawProfile: profile,
      isLoading: isPending,
    }),
    [profile, isPending],
  );

  return (
    <MyRecruiterProfileDataContext.Provider value={value}>
      {children}
    </MyRecruiterProfileDataContext.Provider>
  );
}

export function useMyRecruiterProfileData(): OwnRecruiterProfileRpcResult | null {
  return useContext(MyRecruiterProfileDataContext)?.rawProfile ?? null;
}

export function useMyRecruiterProfileLoading(): boolean {
  return useContext(MyRecruiterProfileDataContext)?.isLoading ?? true;
}

export function useRequiredMyRecruiterProfileData(): OwnRecruiterProfileRpcResult {
  const rawProfile = useMyRecruiterProfileData();

  if (!rawProfile) {
    throw new Error("MyRecruiterProfileDataProvider is required for this page.");
  }

  return rawProfile;
}
