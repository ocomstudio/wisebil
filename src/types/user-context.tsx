// src/context/user-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useAuth, User } from './auth-context';
import type { Transaction } from '@/types/transaction';
import type { Budget } from '@/types/budget';
import type { SavingsGoal } from '@/types/savings-goal';
import type { JournalEntry } from '@/components/dashboard/accounting/journal-entries';
import type { Invoice } from '@/types/invoice';
import type { Language, Currency } from './locale-context';
import type { CompanyProfile } from '@/types/company';
import type { Product, ProductCategory } from '@/types/product';
import type { Sale } from '@/types/sale';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import type { Purchase } from '@/types/purchase';


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
  companyProfile?: CompanyProfile;
  products?: Product[];
  productCategories?: ProductCategory[];
  sales?: Sale[];
  purchases?: Purchase[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  journalEntries: JournalEntry[];
  invoices: Invoice[];
  enterpriseIds?: string[];
  customCategories?: { name: string; emoji: string; }[];
  conversations?: any;
  invoiceCounter?: number;
  saleInvoiceCounter?: number;
  purchaseInvoiceCounter?: number;
  hasCompletedTutorial?: boolean;
}

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  addUserSale: (saleData: Omit<Sale, 'id' | 'date' | 'invoiceNumber'>) => Promise<Sale>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { fullUserData, isLoading } = useAuth();
  const { user } = useAuth();

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

   const addUserSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date' | 'invoiceNumber'>): Promise<Sale> => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) throw new Error("Utilisateur non authentifié");

    const newSaleId = uuidv4();
    let newSale: Sale | null = null;
    
    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw "Document does not exist!";
            }
            
            const currentData = userDoc.data() as UserData;

            // Generate invoice number
            const currentCounter = currentData.saleInvoiceCounter || 0;
            const newCount = currentCounter + 1;
            const invoiceNumber = `SALE-${String(newCount).padStart(4, '0')}`;

            newSale = {
                id: newSaleId,
                invoiceNumber,
                date: new Date().toISOString(),
                ...saleData,
            };

            const currentSales = currentData.sales || [];
            const updatedSales = [...currentSales, newSale];
            
            // Update product stock
            const currentProducts = currentData.products || [];
            const updatedProducts = [...currentProducts];

            for (const item of newSale.items) {
                const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    const newQuantity = updatedProducts[productIndex].quantity - item.quantity;
                    updatedProducts[productIndex] = { ...updatedProducts[productIndex], quantity: newQuantity >= 0 ? newQuantity : 0 };
                }
            }
            
            transaction.update(userDocRef, { 
                sales: updatedSales,
                products: updatedProducts,
                saleInvoiceCounter: newCount,
            });
        });
        if (newSale) {
            return newSale;
        } else {
            throw new Error("La création de la vente a échoué après la transaction.");
        }
    } catch (e) {
      console.error("Failed to add sale and update stock", e);
      throw e;
    }
  }, [getUserDocRef]);

  const value = useMemo(() => ({
    userData: fullUserData,
    isLoading,
    updateUserData,
    addUserSale,
  }), [fullUserData, isLoading, updateUserData, addUserSale]);

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
