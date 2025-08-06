// src/context/transactions-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from './locale-context';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (id: string, updatedTransaction: Transaction) => Promise<void>;
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
    const fetchTransactions = async () => {
      if (!user) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const userDocRef = getUserDocRef();
        if (userDocRef) {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists() && docSnap.data().transactions) {
            setTransactions(docSnap.data().transactions.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          } else {
            setTransactions([]);
          }
        }
      } catch (error) {
        console.error("Failed to load transactions from Firestore", error);
        toast({ variant: "destructive", title: t('error_title'), description: "Failed to load transactions." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [user, toast, t, getUserDocRef]);

  const addTransaction = useCallback(async (transaction: Transaction) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    // Optimistic UI update
    setTransactions(prev => [...prev, transaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    try {
      await setDoc(userDocRef, { transactions: arrayUnion(transaction) }, { merge: true });
    } catch(error) {
       console.error("Failed to add transaction to Firestore", error);
       toast({ variant: "destructive", title: t('error_title'), description: "Failed to save transaction." });
       // Rollback optimistic update
       setTransactions(prev => prev.filter(t => t.id !== transaction.id));
    }
  }, [getUserDocRef, toast, t]);
  
  const updateTransaction = useCallback(async (id: string, updatedTransaction: Transaction) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;

    const oldTransaction = transactions.find(t => t.id === id);
    if (!oldTransaction) return;

    setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    try {
      await updateDoc(userDocRef, {
        transactions: arrayRemove(oldTransaction)
      });
      await updateDoc(userDocRef, {
        transactions: arrayUnion(updatedTransaction)
      });
    } catch(error) {
      console.error("Failed to update transaction in Firestore", error);
      toast({ variant: "destructive", title: t('error_title'), description: "Failed to update transaction." });
      setTransactions(prev => prev.map(t => t.id === id ? oldTransaction : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, [transactions, getUserDocRef, toast, t]);


  const deleteTransaction = useCallback(async (id: string) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;

    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

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
      setTransactions(prev => [...prev, transactionToDelete].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
      setTransactions([]);
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
