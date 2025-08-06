// src/context/savings-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { SavingsGoal } from '@/types/savings-goal';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from './locale-context';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, onSnapshot } from 'firebase/firestore';

interface SavingsContextType {
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  addFunds: (id: string, amount: number) => Promise<void>;
  resetSavings: () => Promise<void>;
  isLoading: boolean;
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export const SavingsProvider = ({ children }: { children: ReactNode }) => {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t, formatCurrency } = useLocale();
  const { user } = useAuth();

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSavingsGoals([]);
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
      if (docSnap.exists() && docSnap.data().savingsGoals) {
        setSavingsGoals(docSnap.data().savingsGoals);
      } else {
        setSavingsGoals([]);
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Failed to listen to savings goals from Firestore", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, getUserDocRef]);

  const addSavingsGoal = useCallback(async (goal: SavingsGoal) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;

    try {
      await setDoc(userDocRef, { savingsGoals: arrayUnion(goal) }, { merge: true });
    } catch(e) {
      console.error("Failed to add savings goal to Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save goal." });
      throw e;
    }
  }, [getUserDocRef, toast]);

  const deleteSavingsGoal = useCallback(async (id: string) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    const goalToDelete = savingsGoals.find(g => g.id === id);
    if (!goalToDelete) return;

    try {
      await updateDoc(userDocRef, { savingsGoals: arrayRemove(goalToDelete) });
      toast({
        title: t('goal_deleted_title'),
        description: t('goal_deleted_desc'),
      });
    } catch(e) {
      console.error("Failed to delete savings goal from Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete goal." });
      throw e;
    }
  }, [savingsGoals, getUserDocRef, toast, t]);

  const addFunds = useCallback(async (idOrName: string, amount: number) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
  
    const currentGoals = [...savingsGoals];
    const goalIndex = currentGoals.findIndex(g => g.id === idOrName || g.name === idOrName);
  
    if (goalIndex === -1) {
      toast({ variant: "destructive", title: "Error", description: "Savings goal not found." });
      console.error("Goal to update not found: ", idOrName);
      return;
    }
    
    const updatedGoal = { 
      ...currentGoals[goalIndex], 
      currentAmount: (currentGoals[goalIndex].currentAmount || 0) + amount 
    };
    currentGoals[goalIndex] = updatedGoal;
    
    try {
      await setDoc(userDocRef, { savingsGoals: currentGoals }, { merge: true });
      toast({
        title: t('funds_added_title'),
        description: t('funds_added_desc', { amount: formatCurrency(amount), goalName: updatedGoal.name }),
      });
    } catch(e) {
      console.error("Failed to add funds in Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to add funds." });
      throw e;
    }
  }, [savingsGoals, getUserDocRef, toast, t, formatCurrency]);

  const resetSavings = async () => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, { savingsGoals: deleteField() });
    } catch(e) {
      console.error("Could not reset savings in Firestore", e);
      throw e;
    }
  };

  return (
    <SavingsContext.Provider value={{ savingsGoals, addSavingsGoal, deleteSavingsGoal, addFunds, resetSavings, isLoading }}>
      {children}
    </SavingsContext.Provider>
  );
};

export const useSavings = () => {
  const context = useContext(SavingsContext);
  if (context === undefined) {
    throw new Error('useSavings must be used within a SavingsProvider');
  }
  return context;
};
