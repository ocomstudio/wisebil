// src/context/budget-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Budget } from '@/types/budget';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, onSnapshot } from 'firebase/firestore';

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  resetBudgets: () => Promise<void>;
  isLoading: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setBudgets([]);
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
      if (docSnap.exists() && docSnap.data().budgets) {
        setBudgets(docSnap.data().budgets);
      } else {
        setBudgets([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to listen to budgets from Firestore", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, getUserDocRef]);

  const addBudget = useCallback(async (budget: Budget) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    try {
      await setDoc(userDocRef, { budgets: arrayUnion(budget) }, { merge: true });
    } catch(e) {
      console.error("Failed to add budget to Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save budget." });
      throw e;
    }
  }, [getUserDocRef, toast]);
  
  const deleteBudget = useCallback(async (id: string) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    const budgetToDelete = budgets.find(b => b.id === id);
    if (!budgetToDelete) return;
    
    try {
      await updateDoc(userDocRef, { budgets: arrayRemove(budgetToDelete) });
      toast({
          title: "Budget supprimé",
          description: "Le budget a été supprimé avec succès.",
      });
    } catch (e) {
      console.error("Failed to delete budget from Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete budget." });
      throw e;
    }
  }, [budgets, getUserDocRef, toast]);

  const resetBudgets = async () => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, { budgets: deleteField() });
    } catch(e) {
        console.error("Could not reset budgets in Firestore", e);
        throw e;
    }
  };

  return (
    <BudgetContext.Provider value={{ budgets, addBudget, deleteBudget, resetBudgets, isLoading }}>
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
