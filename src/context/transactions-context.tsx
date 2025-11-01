// src/context/transactions-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from './locale-context';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, onSnapshot, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { useUserData } from './user-context';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (id: string, updatedTransactionData: Partial<Omit<Transaction, 'id' | 'type'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  resetTransactions: () => Promise<void>;
  balance: number;
  income: number;
  expenses: number;
  isLoading: boolean;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const { userData, isLoading: isUserDataLoading, updateUserData } = useUserData();
  const { toast } = useToast();
  const { t } = useLocale();
  const { user } = useAuth();
  
  const transactions = useMemo(() => {
    if (!userData || !userData.transactions) return [];
    return userData.transactions.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userData]);


  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);
  
  const addTransaction = useCallback(async (transaction: Transaction) => {
    const docRef = getUserDocRef();
    if (!docRef) return;
    
    try {
      await updateUserData({ transactions: arrayUnion(transaction) as any });
    } catch(error: any) {
       console.error("Failed to add transaction to Firestore", error);
       toast({ variant: "destructive", title: t('error_title'), description: "Failed to save transaction." });
       throw error;
    }
  }, [getUserDocRef, toast, t, updateUserData]);
  
  const updateTransaction = useCallback(async (id: string, updatedTransactionData: Partial<Omit<Transaction, 'id' | 'type'>>) => {
    const docRef = getUserDocRef();
    if (!docRef) return;

    const currentTransactions = [...transactions];
    const transactionIndex = currentTransactions.findIndex(t => t.id === id);

    if (transactionIndex === -1) {
      console.error("Transaction to update not found");
      toast({ variant: "destructive", title: t('error_title'), description: t('transaction_not_found') });
      return;
    }

    const updatedTransaction = { ...currentTransactions[transactionIndex], ...updatedTransactionData };
    currentTransactions[transactionIndex] = updatedTransaction;

    try {
      await updateUserData({ transactions: currentTransactions });
    } catch (error) {
      console.error("Failed to update transaction in Firestore", error);
      toast({ variant: "destructive", title: t('error_title'), description: t('transaction_update_error_desc') });
      throw error;
    }
  }, [transactions, getUserDocRef, toast, t, updateUserData]);


  const deleteTransaction = useCallback(async (id: string) => {
    const docRef = getUserDocRef();
    if (!docRef) return;

    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    try {
      await updateUserData({
        transactions: arrayRemove(transactionToDelete) as any
      });
      toast({
          title: t('transaction_deleted_title'),
      });
    } catch(error) {
      console.error("Failed to delete transaction from Firestore", error);
      toast({ variant: "destructive", title: t('error_title'), description: "Failed to delete transaction." });
      throw error;
    }
  }, [transactions, getUserDocRef, toast, t, updateUserData]);

  const getTransactionById = useCallback((id: string) => {
    return transactions.find(t => t.id === id);
  }, [transactions]);

  const resetTransactions = async () => {
    const docRef = getUserDocRef();
    if (!docRef) return;
    try {
      await updateUserData({ transactions: deleteField() as any });
    } catch(e) {
      console.error("Could not reset transactions in Firestore", e)
      throw e;
    }
  };

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
        expenses,
        isLoading: isUserDataLoading
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
