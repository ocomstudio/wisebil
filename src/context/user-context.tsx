// src/context/user-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useAuth, User } from './auth-context';
import type { Transaction } from '@/types/transaction';
import type { Budget } from '@/types/budget';
import type { SavingsGoal } from '@/types/savings-goal';
import type { JournalEntry } from '@/components/dashboard/accounting/journal-entries';
import type { Invoice } from '@/types/invoice';
import type { Language, Currency } from './locale-context';
import type { CompanyProfile } from '@/types/company';
import type { Product } from '@/types/product';
import type { Sale } from '@/types/sale';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


export interface UserData {
  profile: User;
  preferences: {
    language: Language;
    currency: Currency;
  };
  settings: {
    isBalanceHidden: boolean;
    isPinLockEnabled: boolean;
    pin: string | null;
  };
  companyProfile?: CompanyProfile;
  products?: Product[];
  sales?: Sale[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  journalEntries: JournalEntry[];
  invoices: Invoice[];
  enterpriseIds?: string[];
  customCategories?: { name: string; emoji: string; }[];
  conversations?: any;
  invoiceCounter?: number;
  saleInvoiceCounter?: number;
  hasCompletedTutorial?: boolean;
}

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { fullUserData, isLoading } = useAuth();
  const { user } = useAuth();

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  const updateUserData = useCallback(async (dataToUpdate: Partial<UserData>) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) throw new Error("User not authenticated.");

    try {
      const docSnap = await getDoc(userDocRef);
      const currentData = docSnap.exists() ? docSnap.data() as UserData : {};

      const newData = { ...currentData };

      // Loop through the data to update and merge arrays correctly
      for (const key in dataToUpdate) {
        if (Array.isArray(newData[key as keyof UserData]) && Array.isArray(dataToUpdate[key as keyof UserData])) {
           // This logic is for overwriting the whole array, useful for product/sale updates
           (newData as any)[key] = dataToUpdate[key as keyof UserData];
        } else if (typeof dataToUpdate[key as keyof UserData] === 'object' && !Array.isArray(dataToUpdate[key as keyof UserData]) && dataToUpdate[key as keyof UserData] !== null) {
          // Deep merge for nested objects like profile, settings, preferences
          (newData as any)[key] = { ...(newData as any)[key], ...dataToUpdate[key as keyof UserData] };
        }
        else {
          // Simple overwrite for other types
          (newData as any)[key] = dataToUpdate[key as keyof UserData];
        }
      }
      
      await setDoc(userDocRef, newData, { merge: true });

    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  }, [getUserDocRef]);


  const value = useMemo(() => ({
    userData: fullUserData,
    isLoading,
    updateUserData,
  }), [fullUserData, isLoading, updateUserData]);

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
