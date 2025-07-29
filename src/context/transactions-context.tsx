// src/context/transactions-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { Transaction } from '@/types/transaction';
import { useToast } from '@/hooks/use-toast';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (id: string, updatedTransaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  balance: number;
  income: number;
  expenses: number;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  const addTransaction = useCallback(async (transaction: Transaction) => {
    setTransactions(prevTransactions => [...prevTransactions, transaction]);
  }, []);

  const updateTransaction = useCallback(async (id: string, updatedTransaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t));
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
        title: "Transaction supprimée",
    });
  }, [toast]);

  const getTransactionById = useCallback((id: string) => {
    return transactions.find(t => t.id === id);
  }, [transactions]);

  const { balance, income, expenses } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    });

    const balance = income - expenses;
    return { balance, income, expenses };
  }, [transactions]);

  return (
    <TransactionsContext.Provider value={{ 
        transactions, 
        addTransaction, 
        updateTransaction,
        deleteTransaction,
        getTransactionById,
        balance, 
        income, 
        expenses 
    }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
