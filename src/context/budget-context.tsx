// src/context/budget-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Budget } from '@/types/budget';
import { useToast } from '@/hooks/use-toast';

const BUDGETS_STORAGE_KEY = 'wisebil-budgets';

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  resetBudgets: () => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedBudgets = localStorage.getItem(BUDGETS_STORAGE_KEY);
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      }
    } catch (error) {
      console.error("Failed to load budgets from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
      } catch (error) {
        console.error("Failed to save budgets to localStorage", error);
      }
    }
  }, [budgets, isLoaded]);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    setBudgets(prevBudgets => [...prevBudgets, { ...budget, id: new Date().toISOString() }]);
  }, []);
  
  const deleteBudget = useCallback(async (id: string) => {
    setBudgets(prevBudgets => prevBudgets.filter(b => b.id !== id));
    toast({
        title: "Budget supprimé",
        description: "Le budget a été supprimé avec succès.",
    });
  }, [toast]);

  const resetBudgets = useCallback(() => {
    setBudgets([]);
    localStorage.removeItem(BUDGETS_STORAGE_KEY);
  }, []);

  return (
    <BudgetContext.Provider value={{ budgets, addBudget, deleteBudget, resetBudgets }}>
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
