// src/context/transactions-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from './locale-context';

const TRANSACTIONS_STORAGE_KEY = 'wisebil-transactions';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (id: string, updatedTransaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  resetTransactions: () => void;
  balance: number;
  income: number;
  expenses: number;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();
  const { t } = useLocale();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
        const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
        if (storedTransactions) {
            setTransactions(JSON.parse(storedTransactions));
        }
    } catch (error) {
        console.error("Failed to load transactions from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if(isLoaded) {
        try {
            localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
        } catch (error) {
            console.error("Failed to save transactions to localStorage", error);
        }
    }
  }, [transactions, isLoaded]);

  const addTransaction = useCallback(async (transaction: Transaction) => {
    setTransactions(prevTransactions => [...prevTransactions, transaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const updateTransaction = useCallback(async (id: string, updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => (t.id === id ? updatedTransaction : t)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
        title: t('transaction_deleted_title'),
    });
  }, [toast, t]);

  const getTransactionById = useCallback((id: string) => {
    return transactions.find(t => t.id === id);
  }, [transactions]);

  const resetTransactions = useCallback(() => {
    setTransactions([]);
    localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
  }, []);

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
        resetTransactions,
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
