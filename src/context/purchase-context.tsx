// src/context/purchase-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo, useState, useEffect } from 'react';
import type { Purchase } from '@/types/purchase';
import { v4 as uuidv4 } from "uuid";
import { db } from '@/lib/firebase';
import { doc, runTransaction, onSnapshot, arrayUnion } from 'firebase/firestore';
import { useAuth } from './auth-context';
import type { ActivityLog } from '@/types/activity-log';
import type { Enterprise } from '@/types/enterprise';
import { useEnterprise } from './enterprise-context';

interface PurchasesContextType {
  purchases: Purchase[];
  addPurchase: (purchaseData: Omit<Purchase, 'id' | 'date' | 'invoiceNumber' | 'userId'>) => Promise<Purchase>;
  getPurchaseById: (id: string) => Purchase | undefined;
  isLoading: boolean;
}

const PurchasesContext = createContext<PurchasesContextType | undefined>(undefined);

export const PurchasesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { enterprises, isLoading: isLoadingEnterprises } = useEnterprise();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For now, we assume the user has only one enterprise.
  const activeEnterprise = useMemo(() => enterprises.length > 0 ? enterprises[0] : null, [enterprises]);

  useEffect(() => {
    if (!activeEnterprise) {
        setIsLoading(false);
        setPurchases([]);
        return;
    }

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const unsubscribe = onSnapshot(enterpriseDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const enterpriseData = docSnap.data() as Enterprise;
            const sortedPurchases = (enterpriseData.purchases || []).sort((a: Purchase, b: Purchase) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setPurchases(sortedPurchases);
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Failed to listen to enterprise purchases:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeEnterprise]);
  
  const getPurchaseById = useCallback((id: string) => {
    return purchases.find(p => p.id === id);
  }, [purchases]);

  const addPurchase = useCallback(async (purchaseData: Omit<Purchase, 'id' | 'date' | 'invoiceNumber' | 'userId'>): Promise<Purchase> => {
    if (!user || !activeEnterprise) throw new Error("Utilisateur ou entreprise non authentifié");

    const newPurchaseId = uuidv4();
    let newPurchase: Purchase | null = null;
    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    
    try {
        await runTransaction(db, async (transaction) => {
            const enterpriseDoc = await transaction.get(enterpriseDocRef);
            if (!enterpriseDoc.exists()) throw "Le document de l'entreprise n'existe pas !";
            
            const currentData = enterpriseDoc.data() as Enterprise;
            const currentCounter = currentData.purchaseInvoiceCounter || 0;
            const newCount = currentCounter + 1;
            const invoiceNumber = `PURCH-${String(newCount).padStart(4, '0')}`;

            newPurchase = {
                id: newPurchaseId,
                invoiceNumber,
                date: new Date().toISOString(),
                userId: user.uid,
                ...purchaseData,
            };

            const updatedPurchases = [...(currentData.purchases || []), newPurchase];
            
            const currentProducts = currentData.products || [];
            const updatedProducts = [...currentProducts];

            for (const item of newPurchase.items) {
                const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    const product = updatedProducts[productIndex];
                    const newQuantity = product.quantity + item.quantity;
                    product.quantity = newQuantity;
                    product.initialQuantity = newQuantity > product.initialQuantity ? newQuantity : product.initialQuantity;
                    product.purchasePrice = item.price;
                }
            }
            
            const newLog: ActivityLog = {
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              type: 'purchase_created',
              description: `Achat #${invoiceNumber} créé auprès de ${newPurchase.supplierName}.`,
              userName: user?.displayName || 'Unknown',
              userId: user?.uid || 'Unknown',
            };

            transaction.update(enterpriseDocRef, { 
                purchases: updatedPurchases,
                products: updatedProducts,
                purchaseInvoiceCounter: newCount,
                enterpriseActivities: arrayUnion(newLog)
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
  }, [user, activeEnterprise]);


  return (
    <PurchasesContext.Provider value={{ purchases, addPurchase, getPurchaseById, isLoading: isLoading || isLoadingEnterprises }}>
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
