"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { OwnCandidateProfileRpcResult } from "@/lib/profile/own-candidate-profile-rpc.types";

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
  rawProfile,
  children,
}: MyProfileDataProviderProps) {
  const [profile, setProfile] = useState(rawProfile);

  useEffect(() => {
    setProfile(rawProfile);
  }, [rawProfile]);

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
