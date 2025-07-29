// src/context/budget-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Budget } from '@/types/budget';
import { useToast } from '@/hooks/use-toast';

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const { toast } = useToast();

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

  return (
    <BudgetContext.Provider value={{ budgets, addBudget, deleteBudget }}>
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
