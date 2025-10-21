// src/context/company-profile-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import type { CompanyProfile } from '@/types/company';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useUserData } from './user-context';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from './locale-context';

interface CompanyProfileContextType {
  companyProfile: CompanyProfile | null;
  updateCompanyProfile: (newProfile: Partial<CompanyProfile>) => Promise<void>;
  isLoading: boolean;
}

const defaultCompanyProfile: CompanyProfile = {
  name: "",
  address: "",
  brandColor: "#179C00", // Emerald Green
  dailyReportEnabled: false,
  dailyReportTime: "18:00",
  dailyReportFormat: "excel",
};

const CompanyProfileContext = createContext<CompanyProfileContextType | undefined>(undefined);

export const CompanyProfileProvider = ({ children }: { children: ReactNode }) => {
  const { userData, isLoading: isUserDataLoading } = useUserData();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();

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
  
  useEffect(() => {
    if (!companyProfile || !companyProfile.dailyReportEnabled || !companyProfile.dailyReportTime) {
      return;
    }

    const checkTime = () => {
      const now = new Date();
      const [hours, minutes] = (companyProfile.dailyReportTime || "00:00").split(':').map(Number);
      const reportTime = new Date();
      reportTime.setHours(hours, minutes, 0, 0);

      // Check if current time is within a minute of the report time to avoid missing it
      if (
        now.getHours() === reportTime.getHours() &&
        now.getMinutes() === reportTime.getMinutes()
      ) {
         toast({
          title: "Rapport journalier envoyé",
          description: `Votre rapport d'activité de l'entreprise a été envoyé par e-mail.`,
        });
      }
    };
    
    // Check every minute
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, [companyProfile, toast]);


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
