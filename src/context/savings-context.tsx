// src/context/savings-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { SavingsGoal } from '@/types/savings-goal';
import { useToast } from '@/hooks/use-toast';

interface SavingsContextType {
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  addFunds: (id: string, amount: number) => Promise<void>;
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export const SavingsProvider = ({ children }: { children: ReactNode }) => {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const { toast } = useToast();

  const addSavingsGoal = useCallback(async (goal: SavingsGoal) => {
    setSavingsGoals(prev => [...prev, goal]);
  }, []);

  const deleteSavingsGoal = useCallback(async (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
    toast({
      title: "Objectif supprimé",
      description: "Votre objectif d'épargne a été supprimé.",
    });
  }, [toast]);

  const addFunds = useCallback(async (id: string, amount: number) => {
    setSavingsGoals(prev => prev.map(g => 
      g.id === id 
        ? { ...g, currentAmount: g.currentAmount + amount } 
        : g
    ));
    toast({
      title: "Fonds ajoutés !",
      description: `${amount.toLocaleString('fr-FR')} FCFA ont été ajoutés à votre objectif.`,
    });
  }, [toast]);

  return (
    <SavingsContext.Provider value={{ savingsGoals, addSavingsGoal, deleteSavingsGoal, addFunds }}>
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
