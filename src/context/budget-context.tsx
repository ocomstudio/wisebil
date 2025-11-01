// src/context/budget-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Budget } from '@/types/budget';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, onSnapshot } from 'firebase/firestore';
import { useUserData } from './user-context';

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Budget) => Promise<void>;
  updateBudget: (id: string, updatedBudget: Omit<Budget, 'id'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  resetBudgets: () => Promise<void>;
  isLoading: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const { userData, isLoading: isUserDataLoading, updateUserData } = useUserData();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const budgets = useMemo(() => userData?.budgets || [], [userData]);

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  const addBudget = useCallback(async (budget: Budget) => {
    try {
      await updateUserData({ budgets: arrayUnion(budget) as any });
    } catch(e) {
      console.error("Failed to add budget to Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save budget." });
      throw e;
    }
  }, [toast, updateUserData]);
  
  const updateBudget = useCallback(async (id: string, updatedBudgetData: Omit<Budget, 'id'>) => {
    const currentBudgets = [...budgets];
    const budgetIndex = currentBudgets.findIndex(b => b.id === id);

    if (budgetIndex === -1) {
      toast({ variant: "destructive", title: "Erreur", description: "Budget non trouvé." });
      return;
    }
    
    const updatedBudget = { ...currentBudgets[budgetIndex], ...updatedBudgetData };
    currentBudgets[budgetIndex] = updatedBudget;
    
    try {
      await updateUserData({ budgets: currentBudgets });
    } catch (e) {
      console.error("Failed to update budget in Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to update budget." });
      throw e;
    }
  }, [budgets, toast, updateUserData]);

  const deleteBudget = useCallback(async (id: string) => {
    const budgetToDelete = budgets.find(b => b.id === id);
    if (!budgetToDelete) return;
    
    try {
      await updateUserData({ budgets: arrayRemove(budgetToDelete) as any });
      toast({
          title: "Budget supprimé",
          description: "Le budget a été supprimé avec succès.",
      });
    } catch (e) {
      console.error("Failed to delete budget from Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete budget." });
      throw e;
    }
  }, [budgets, toast, updateUserData]);

  const resetBudgets = async () => {
    try {
      await updateUserData({ budgets: deleteField() as any });
    } catch(e) {
        console.error("Could not reset budgets in Firestore", e);
        throw e;
    }
  };

  return (
    <BudgetContext.Provider value={{ budgets, addBudget, updateBudget, deleteBudget, resetBudgets, isLoading: isUserDataLoading }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};
