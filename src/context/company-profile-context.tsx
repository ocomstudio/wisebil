// src/context/company-profile-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { CompanyProfile } from '@/types/company';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useEnterprise } from './enterprise-context';

interface CompanyProfileContextType {
  companyProfile: CompanyProfile | null;
  updateCompanyProfile: (newProfileData: Partial<CompanyProfile>) => Promise<void>;
  isLoading: boolean;
}

const CompanyProfileContext = createContext<CompanyProfileContextType | undefined>(undefined);

export const CompanyProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { activeEnterprise, isLoading: isLoadingEnterprise } = useEnterprise();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoadingEnterprise || !activeEnterprise) {
      setIsLoading(false);
      setCompanyProfile(null);
      return;
    }

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const unsubscribe = onSnapshot(enterpriseDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompanyProfile(data.companyProfile || null);
      } else {
        setCompanyProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeEnterprise, isLoadingEnterprise]);

  const updateCompanyProfile = useCallback(async (newProfileData: Partial<CompanyProfile>) => {
    if (!user || !activeEnterprise) throw new Error("User or enterprise not available");

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    
    // Create the update payload by prefixing keys with 'companyProfile.'
    const updatePayload: { [key: string]: any } = {};
    for (const key in newProfileData) {
        updatePayload[`companyProfile.${key}`] = (newProfileData as any)[key];
    }
    
    await updateDoc(enterpriseDocRef, updatePayload);

  }, [user, activeEnterprise]);

  const value = {
    companyProfile,
    updateCompanyProfile,
    isLoading: isLoading || isLoadingEnterprise,
  };

  return (
    <CompanyProfileContext.Provider value={value}>
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
