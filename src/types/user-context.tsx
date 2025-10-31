// src/context/user-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useAuth, User } from './auth-context';
import type { Transaction } from '@/types/transaction';
import type { Budget } from '@/types/budget';
import type { SavingsGoal } from '@/types/savings-goal';
import type { Language, Currency } from './locale-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, collectionGroup, query, where, getDocs, limit, getDoc } from 'firebase/firestore';


export interface UserData {
  profile: User;
  preferences: {
    language: Language;
    currency: Currency;
  };
  settings: {
    isBalanceHidden: boolean;
    isPinLockEnabled: boolean;
    pin: string | null;
  };
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  enterpriseIds?: string[];
  customCategories?: { name: string; emoji: string; }[];
  conversations?: any;
}

// Function to fetch user data based on sale ID (server-side usage)
export async function getUserBySaleId(saleId: string): Promise<UserData | null> {
    try {
        const salesQuery = query(collectionGroup(db, 'sales'), where('id', '==', saleId), limit(1));
        const saleSnapshot = await getDocs(salesQuery);

        if (saleSnapshot.empty) {
            console.warn(`No sale found with ID: ${saleId}`);
            return null;
        }

        const saleDoc = saleSnapshot.docs[0];
        const enterpriseDocRef = saleDoc.ref.parent.parent;

        if (!enterpriseDocRef) {
             console.error(`Could not find parent enterprise for sale ID: ${saleId}`);
             return null;
        }
        
        const enterpriseDocSnap = await getDoc(enterpriseDocRef);
        const ownerId = enterpriseDocSnap.data()?.ownerId;

        if (!ownerId) {
            console.error(`Could not find owner for sale ID: ${saleId}`);
            return null;
        }

        const userDocSnap = await getDoc(doc(db, 'users', ownerId));

        if (userDocSnap.exists()) {
            return userDocSnap.data() as UserData;
        } else {
            console.error(`User document not found for sale ID: ${saleId}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user by sale ID:", error);
        return null;
    }
}


// Function to fetch user data based on purchase ID (server-side usage)
export async function getUserByPurchaseId(purchaseId: string): Promise<UserData | null> {
    const q = query(collectionGroup(db, 'purchases'), where('id', '==', purchaseId), limit(1));
    const purchaseSnapshot = await getDocs(q);

    if (purchaseSnapshot.empty) {
        console.warn(`No purchase found with ID: ${purchaseId}`);
        return null;
    }

    const purchaseDoc = purchaseSnapshot.docs[0];
    const enterpriseDocRef = purchaseDoc.ref.parent.parent;
    if (!enterpriseDocRef) {
         console.error(`Could not find parent enterprise for purchase ID: ${purchaseId}`);
         return null;
    }
    
    const enterpriseDocSnap = await getDoc(enterpriseDocRef);
    const ownerId = enterpriseDocSnap.data()?.ownerId;

    if (!ownerId) {
        console.error(`Could not find owner for purchase ID: ${purchaseId}`);
        return null;
    }

    const userDocSnap = await getDoc(doc(db, 'users', ownerId));

    if (userDocSnap.exists()) {
        return userDocSnap.data() as UserData;
    } else {
        console.error(`User document not found for purchase ID: ${purchaseId}`);
        return null;
    }
}

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children, initialData }: { children: ReactNode, initialData?: UserData | null }) => {
  const { fullUserData: authFullUserData, isLoading: authIsLoading } = useAuth();
  const { user } = useAuth();

  const userData = initialData || authFullUserData;
  const isLoading = initialData ? false : authIsLoading;


  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  const updateUserData = useCallback(async (dataToUpdate: Partial<UserData>) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) throw new Error("User not authenticated.");

    try {
        await setDoc(userDocRef, dataToUpdate, { merge: true });
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  }, [getUserDocRef]);


  const value = useMemo(() => ({
    userData: userData,
    isLoading,
    updateUserData,
  }), [userData, isLoading, updateUserData]);

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
