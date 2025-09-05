// src/context/accounting-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { JournalEntry } from '@/components/dashboard/accounting/journal-entries';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, onSnapshot } from 'firebase/firestore';
import { useUserData } from './user-context';


interface AccountingContextType {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry[]) => Promise<void>;
  resetEntries: () => Promise<void>;
  isLoading: boolean;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider = ({ children }: { children: ReactNode }) => {
  const { userData, isLoading: isUserDataLoading } = useUserData();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const entries = useMemo(() => {
    if (!userData || !userData.journalEntries) return [];
    // Ensure date objects are correctly parsed if they are stored as Timestamps
    return userData.journalEntries.map((e: any) => ({
      ...e,
      date: e.date?.toDate ? e.date.toDate() : new Date(e.date),
    }));
  }, [userData]);

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);
  
  const addEntry = useCallback(async (newEntries: JournalEntry[]) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    // Convert Date objects to Firestore Timestamps for storage
    const entriesToStore = newEntries.map(e => ({ ...e, date: e.date }));

    try {
      await updateDoc(userDocRef, { 
        journalEntries: arrayUnion(...entriesToStore) 
      });
    } catch(e) {
       console.error("Failed to add journal entries to Firestore", e);
       toast({ variant: "destructive", title: "Error", description: "Failed to save journal entries." });
       throw e;
    }
  }, [getUserDocRef, toast]);

  const resetEntries = async () => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, { journalEntries: deleteField() });
    } catch(e) {
        console.error("Could not reset journal entries in Firestore", e);
        throw e;
    }
  };

  return (
    <AccountingContext.Provider value={{ entries, addEntry, resetEntries, isLoading: isUserDataLoading }}>
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (context === undefined) {
    throw new Error('useAccounting must be used within a AccountingProvider');
  }
  return context;
};
