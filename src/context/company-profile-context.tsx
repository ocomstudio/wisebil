// src/context/company-profile-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { CompanyProfile } from '@/types/company';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useUserData } from './user-context';


interface CompanyProfileContextType {
  companyProfile: CompanyProfile | null;
  updateCompanyProfile: (newProfile: Partial<CompanyProfile>) => Promise<void>;
  isLoading: boolean;
}

const defaultCompanyProfile: CompanyProfile = {
  address: "",
  logoUrl: "",
  signatureUrl: "",
  stampUrl: "",
  brandColor: "#50C878", // Emerald Green
};

const CompanyProfileContext = createContext<CompanyProfileContextType | undefined>(undefined);

export const CompanyProfileProvider = ({ children }: { children: ReactNode }) => {
  const { userData, isLoading: isUserDataLoading } = useUserData();
  const { user } = useAuth();

  const companyProfile = useMemo(() => userData?.companyProfile || null, [userData]);

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  const updateCompanyProfile = useCallback(async (newProfileData: Partial<CompanyProfile>) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    const updatedProfile = { ...(companyProfile || defaultCompanyProfile), ...newProfileData };
    
    try {
        await updateDoc(userDocRef, { companyProfile: updatedProfile });
    } catch(e) {
        console.error("Failed to update company profile in Firestore", e);
        // Optionally, show a toast to the user
    }
  }, [companyProfile, getUserDocRef]);


  return (
    <CompanyProfileContext.Provider value={{ companyProfile, updateCompanyProfile, isLoading: isUserDataLoading }}>
      {children}
    </CompanyProfileContext.Provider>
  );
};

export const useCompanyProfile = () => {
  const context = useContext(CompanyProfileContext);
  if (context === undefined) {
    throw new Error('useCompanyProfile must be used within a CompanyProfileProvider');
  }
  return context;
};
