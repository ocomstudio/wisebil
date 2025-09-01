// src/context/accounting-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { JournalEntry } from '@/components/dashboard/accounting/journal-entries';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, onSnapshot } from 'firebase/firestore';

interface AccountingContextType {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry[]) => Promise<void>;
  resetEntries: () => Promise<void>;
  isLoading: boolean;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    const userDocRef = getUserDocRef();
    if (!userDocRef) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().journalEntries) {
        const entriesWithDates = docSnap.data().journalEntries.map((e: any) => ({
          ...e,
          date: e.date.toDate(),
        }));
        setEntries(entriesWithDates);
      } else {
        setEntries([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to listen to journal entries from Firestore", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, getUserDocRef]);

  const addEntry = useCallback(async (newEntries: JournalEntry[]) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    try {
      const updatedEntries = [...entries, ...newEntries];
      await setDoc(userDocRef, { journalEntries: updatedEntries }, { merge: true });

    } catch(e) {
      console.error("Failed to add journal entries to Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save journal entries." });
      throw e;
    }
  }, [entries, getUserDocRef, toast]);

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
    <AccountingContext.Provider value={{ entries, addEntry, resetEntries, isLoading }}>
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
