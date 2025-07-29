// src/context/budget-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Budget } from '@/types/budget';

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Budget) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const addBudget = useCallback(async (budget: Budget) => {
    // In a real app, you would post this to your API
    // For now, we just add it to the local state
    setBudgets(prevBudgets => [...prevBudgets, budget]);
  }, []);

  return (
    <BudgetContext.Provider value={{ budgets, addBudget }}>
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
