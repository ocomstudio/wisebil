// src/context/purchase-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { Purchase } from '@/types/purchase';
import { useUserData } from './user-context';
import { v4 as uuidv4 } from "uuid";
import { db } from '@/lib/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import { useAuth } from './auth-context';
import type { UserData } from './user-context';

interface PurchasesContextType {
  purchases: Purchase[];
  addPurchase: (purchaseData: Omit<Purchase, 'id' | 'date' | 'invoiceNumber'>) => Promise<Purchase>;
  getPurchaseById: (id: string) => Purchase | undefined;
  isLoading: boolean;
}

const PurchasesContext = createContext<PurchasesContextType | undefined>(undefined);

export const PurchasesProvider = ({ children }: { children: ReactNode }) => {
  const { userData, isLoading: isUserDataLoading } = useUserData();
  const { user } = useAuth();
  
  const purchases = useMemo(() => {
     if (!userData || !userData.purchases) return [];
     return userData.purchases.sort((a: Purchase, b: Purchase) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userData]);
  
  const getPurchaseById = useCallback((id: string) => {
    return purchases.find(p => p.id === id);
  }, [purchases]);

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  const addPurchase = useCallback(async (purchaseData: Omit<Purchase, 'id' | 'date' | 'invoiceNumber'>): Promise<Purchase> => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) throw new Error("Utilisateur non authentifié");

    const newPurchaseId = uuidv4();
    let newPurchase: Purchase | null = null;
    
    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw "Document does not exist!";
            }
            
            const currentData = userDoc.data() as UserData;

            // Generate invoice number
            const currentCounter = currentData.purchaseInvoiceCounter || 0;
            const newCount = currentCounter + 1;
            const invoiceNumber = `PURCH-${String(newCount).padStart(4, '0')}`;

            newPurchase = {
                id: newPurchaseId,
                invoiceNumber,
                date: new Date().toISOString(),
                ...purchaseData,
            };

            const currentPurchases = currentData.purchases || [];
            const updatedPurchases = [...currentPurchases, newPurchase];
            
            // Update product stock
            const currentProducts = currentData.products || [];
            const updatedProducts = [...currentProducts];

            for (const item of newPurchase.items) {
                const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    updatedProducts[productIndex].quantity += item.quantity;
                }
            }
            
            transaction.update(userDocRef, { 
                purchases: updatedPurchases,
                products: updatedProducts,
                purchaseInvoiceCounter: newCount,
            });
        });
        if (newPurchase) {
            return newPurchase;
        } else {
            throw new Error("La création de l'achat a échoué après la transaction.");
        }
    } catch (e) {
      console.error("Failed to add purchase and update stock", e);
      throw e;
    }
  }, [getUserDocRef]);


  return (
    <PurchasesContext.Provider value={{ purchases, addPurchase, getPurchaseById, isLoading: isUserDataLoading }}>
      {children}
    </PurchasesContext.Provider>
  );
};

export const usePurchases = () => {
  const context = useContext(PurchasesContext);
  if (context === undefined) {
    throw new Error('usePurchases must be used within a PurchasesProvider');
  }
  return context;
};
