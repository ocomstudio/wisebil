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
import type { ActivityLog } from '@/types/activity-log';
import { useToast } from '@/hooks/use-toast';


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
  enterpriseActivities?: ActivityLog[];
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
  logActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp' | 'userName' | 'userId'>) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { fullUserData, isLoading } = useAuth();
  const { user } = useAuth();
  const { toast } = useToast();

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
  
  const logActivity = useCallback(async (activity: Omit<ActivityLog, 'id' | 'timestamp' | 'userName' | 'userId'>) => {
    if (!user) return;
    const newLog: ActivityLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      userName: user.displayName || 'Utilisateur inconnu',
      userId: user.uid,
      ...activity,
    };
    const currentActivities = fullUserData?.enterpriseActivities || [];
    await updateUserData({ enterpriseActivities: [newLog, ...currentActivities] });
  }, [user, fullUserData?.enterpriseActivities, updateUserData]);


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
                    const product = updatedProducts[productIndex];
                    const newQuantity = product.quantity - item.quantity;
                    updatedProducts[productIndex] = { ...product, quantity: newQuantity >= 0 ? newQuantity : 0 };
                }
            }
            
             const newLog: ActivityLog = {
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              type: 'sale_created',
              description: `Vente #${invoiceNumber} créée pour ${newSale.customerName}.`,
              userName: user?.displayName || 'Unknown',
              userId: user?.uid || 'Unknown',
            };
            const currentActivities = currentData.enterpriseActivities || [];
            
            transaction.update(userDocRef, { 
                sales: updatedSales,
                products: updatedProducts,
                saleInvoiceCounter: newCount,
                enterpriseActivities: [newLog, ...currentActivities],
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
  }, [getUserDocRef, user, toast]);

  const value = useMemo(() => ({
    userData: fullUserData,
    isLoading,
    updateUserData,
    addUserSale,
    logActivity
  }), [fullUserData, isLoading, updateUserData, addUserSale, logActivity]);

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
