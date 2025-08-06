// src/context/transactions-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from './locale-context';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, onSnapshot } from 'firebase/firestore';

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLocale();
  const { user } = useAuth();

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
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
      if (docSnap.exists() && docSnap.data().transactions) {
        const sortedTransactions = docSnap.data().transactions.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(sortedTransactions);
      } else {
        setTransactions([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to listen to transactions from Firestore", error);
      toast({ variant: "destructive", title: t('error_title'), description: "Failed to load transactions." });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, getUserDocRef, toast, t]);

  const addTransaction = useCallback(async (transaction: Transaction) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    try {
      await setDoc(userDocRef, { transactions: arrayUnion(transaction) }, { merge: true });
    } catch(error) {
       console.error("Failed to add transaction to Firestore", error);
       toast({ variant: "destructive", title: t('error_title'), description: "Failed to save transaction." });
       throw error;
    }
  }, [getUserDocRef, toast, t]);
  
  const updateTransaction = useCallback(async (id: string, updatedTransactionData: Partial<Omit<Transaction, 'id' | 'type'>>) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;

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
      await setDoc(userDocRef, { transactions: currentTransactions }, { merge: true });
    } catch (error) {
      console.error("Failed to update transaction in Firestore", error);
      toast({ variant: "destructive", title: t('error_title'), description: t('transaction_update_error_desc') });
      throw error;
    }
  }, [transactions, getUserDocRef, toast, t]);


  const deleteTransaction = useCallback(async (id: string) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;

    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    try {
      await updateDoc(userDocRef, {
        transactions: arrayRemove(transactionToDelete)
      });
      toast({
          title: t('transaction_deleted_title'),
      });
    } catch(error) {
      console.error("Failed to delete transaction from Firestore", error);
      toast({ variant: "destructive", title: t('error_title'), description: "Failed to delete transaction." });
      throw error;
    }
  }, [transactions, getUserDocRef, toast, t]);

  const getTransactionById = useCallback((id: string) => {
    return transactions.find(t => t.id === id);
  }, [transactions]);

  const resetTransactions = async () => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, { transactions: deleteField() });
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
        isLoading
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
