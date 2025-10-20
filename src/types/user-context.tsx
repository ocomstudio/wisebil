// src/context/user-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
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
}

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { fullUserData, isLoading } = useAuth();

  const value = useMemo(() => ({
    userData: fullUserData,
    isLoading,
  }), [fullUserData, isLoading]);

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
