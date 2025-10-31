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
import { doc, getDoc, setDoc, runTransaction, collection, query, where, getDocs, limit, collectionGroup, updateDoc, arrayUnion } from 'firebase/firestore';
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
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  enterpriseIds?: string[];
  customCategories?: { name: string; emoji: string; }[];
  conversations?: any;
}

export interface EnterpriseData {
  companyProfile?: CompanyProfile;
  products?: Product[];
  productCategories?: ProductCategory[];
  sales?: Sale[];
  purchases?: Purchase[];
  enterpriseActivities?: ActivityLog[];
  journalEntries?: JournalEntry[];
  invoices?: Invoice[];
  invoiceCounter?: number;
  saleInvoiceCounter?: number;
  purchaseInvoiceCounter?: number;
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
  addUserSale: (saleData: Omit<Sale, 'id' | 'date' | 'invoiceNumber' | 'userId'>, enterpriseId: string) => Promise<Sale>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children, initialData }: { children: ReactNode, initialData?: UserData | null }) => {
  const { fullUserData: authFullUserData, isLoading: authIsLoading } = useAuth();
  const { user } = useAuth();
  const { toast } = useToast();

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

   const addUserSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date' | 'invoiceNumber' | 'userId'>, enterpriseId: string): Promise<Sale> => {
    if (!user) throw new Error("Utilisateur non authentifié");

    const newSaleId = uuidv4();
    let newSale: Sale | null = null;
    const enterpriseDocRef = doc(db, 'enterprises', enterpriseId);
    
    try {
        await runTransaction(db, async (transaction) => {
            const enterpriseDoc = await transaction.get(enterpriseDocRef);
            if (!enterpriseDoc.exists()) throw "Le document de l'entreprise n'existe pas !";
            
            const currentData = enterpriseDoc.data() as EnterpriseData;
            const currentCounter = currentData.saleInvoiceCounter || 0;
            const newCount = currentCounter + 1;
            const invoiceNumber = `SALE-${String(newCount).padStart(4, '0')}`;

            newSale = {
                id: newSaleId,
                invoiceNumber,
                date: new Date().toISOString(),
                userId: user.uid,
                ...saleData,
            };

            const updatedSales = [...(currentData.sales || []), newSale];
            
            const currentProducts = currentData.products || [];
            const updatedProducts = [...currentProducts];

            for (const item of newSale.items) {
                const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    const product = updatedProducts[productIndex];
                     if (product.quantity < item.quantity) {
                        throw new Error(`Stock insuffisant pour le produit "${product.name}".`);
                    }
                    const newQuantity = product.quantity - item.quantity;
                    updatedProducts[productIndex] = { ...product, quantity: newQuantity >= 0 ? newQuantity : 0 };
                } else {
                    throw new Error(`Produit avec ID ${item.productId} non trouvé.`);
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
            
            transaction.update(enterpriseDocRef, { 
                sales: updatedSales,
                products: updatedProducts,
                saleInvoiceCounter: newCount,
                enterpriseActivities: arrayUnion(newLog),
            });
        });
        if (newSale) {
            return newSale;
        } else {
            throw new Error("La création de la vente a échoué après la transaction.");
        }
    } catch (e: any) {
      console.error("Failed to add sale and update stock", e);
      toast({
        variant: "destructive",
        title: "Erreur de Vente",
        description: e.message || "Une erreur est survenue lors de l'enregistrement de la vente."
      })
      throw e;
    }
  }, [user, toast]);

  const value = useMemo(() => ({
    userData: userData,
    isLoading,
    updateUserData,
    addUserSale,
  }), [userData, isLoading, updateUserData, addUserSale]);

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
