// src/context/company-profile-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo, useEffect, useState } from 'react';
import type { CompanyProfile } from '@/types/company';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useEnterprise } from './enterprise-context';

interface CompanyProfileContextType {
  companyProfile: CompanyProfile | null;
  updateCompanyProfile: (newProfile: Partial<CompanyProfile>) => Promise<void>;
  isLoading: boolean;
}

const CompanyProfileContext = createContext<CompanyProfileContextType | undefined>(undefined);

export const CompanyProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { enterprises, isLoading: isLoadingEnterprises } = useEnterprise();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // For now, we assume the user has only one enterprise.
  const activeEnterprise = useMemo(() => enterprises.length > 0 ? enterprises[0] : null, [enterprises]);

  useEffect(() => {
    if (!activeEnterprise) {
        setIsLoading(false);
        setCompanyProfile(null);
        return;
    }

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const unsubscribe = onSnapshot(enterpriseDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const enterpriseData = docSnap.data();
            setCompanyProfile(enterpriseData.companyProfile || null);
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Failed to listen to company profile:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeEnterprise]);


  const updateCompanyProfile = useCallback(async (newProfileData: Partial<CompanyProfile>) => {
    if (!activeEnterprise) return;
    
    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    
    try {
        await updateDoc(enterpriseDocRef, { 'companyProfile': { ...companyProfile, ...newProfileData } });
    } catch(e) {
        console.error("Failed to update company profile in Firestore", e);
    }
  }, [activeEnterprise, companyProfile]);
  

  return (
    <CompanyProfileContext.Provider value={{ companyProfile, updateCompanyProfile, isLoading: isLoading || isLoadingEnterprises }}>
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
