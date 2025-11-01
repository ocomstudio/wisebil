// src/context/savings-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from "uuid";
import { SavingsGoal } from '@/types/savings-goal';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from './locale-context';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, onSnapshot } from 'firebase/firestore';
import { useUserData } from './user-context';
import { useTransactions } from './transactions-context';


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
  const { userData, isLoading: isUserDataLoading, updateUserData } = useUserData();
  const { toast } = useToast();
  const { t, formatCurrency } = useLocale();
  const { user } = useAuth();
  const { addTransaction } = useTransactions();
  
  const savingsGoals = useMemo(() => userData?.savingsGoals || [], [userData]);

  const addSavingsGoal = useCallback(async (goal: SavingsGoal) => {
    try {
      await updateUserData({ savingsGoals: arrayUnion(goal) as any });
    } catch(e) {
      console.error("Failed to add savings goal to Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save goal." });
      throw e;
    }
  }, [toast, updateUserData]);

  const deleteSavingsGoal = useCallback(async (id: string) => {
    const goalToDelete = savingsGoals.find(g => g.id === id);
    if (!goalToDelete) return;

    try {
      await updateUserData({ savingsGoals: arrayRemove(goalToDelete) as any });
      toast({
        title: t('goal_deleted_title'),
        description: t('goal_deleted_desc'),
      });
    } catch(e) {
      console.error("Failed to delete savings goal from Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete goal." });
      throw e;
    }
  }, [savingsGoals, toast, t, updateUserData]);

  const addFunds = useCallback(async (idOrName: string, amount: number) => {
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
      // First, update the savings goal in Firestore
      await updateUserData({ savingsGoals: currentGoals });

      // Then, create a corresponding expense transaction
      await addTransaction({
        id: uuidv4(),
        type: 'expense',
        amount,
        description: t('funds_added_desc', { amount: formatCurrency(amount, 'XOF'), goalName: updatedGoal.name }),
        category: 'Épargne',
        date: new Date().toISOString()
      });

      toast({
        title: t('funds_added_title'),
        description: t('funds_added_desc', { amount: formatCurrency(amount, 'XOF'), goalName: updatedGoal.name }),
      });
    } catch(e) {
      console.error("Failed to add funds in Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to add funds." });
      throw e;
    }
  }, [savingsGoals, toast, t, formatCurrency, addTransaction, updateUserData]);

  const resetSavings = async () => {
    try {
      await updateUserData({ savingsGoals: deleteField() as any });
    } catch(e) {
      console.error("Could not reset savings in Firestore", e);
      throw e;
    }
  };

  return (
    <SavingsContext.Provider value={{ savingsGoals, addSavingsGoal, deleteSavingsGoal, addFunds, resetSavings, isLoading: isUserDataLoading }}>
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
