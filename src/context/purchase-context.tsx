// src/context/purchase-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Purchase } from '@/types/purchase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { useEnterprise } from './enterprise-context';
import { v4 as uuidv4 } from 'uuid';
import { ActivityLog } from '@/types/activity-log';

interface PurchasesContextType {
  purchases: Purchase[];
  addPurchase: (purchaseData: Omit<Purchase, 'id' | 'date' | 'invoiceNumber' | 'userId'>) => Promise<Purchase>;
  getPurchaseById: (id: string) => Purchase | undefined;
  isLoading: boolean;
}

const PurchasesContext = createContext<PurchasesContextType | undefined>(undefined);

export const PurchasesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { activeEnterprise, isLoading: isLoadingEnterprises } = useEnterprise();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoadingEnterprises || !activeEnterprise) {
      setIsLoading(true);
      setPurchases([]);
      return;
    }

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const unsubscribe = onSnapshot(enterpriseDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPurchases(data.purchases || []);
      } else {
        setPurchases([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeEnterprise, isLoadingEnterprises]);

  const addPurchase = useCallback(async (purchaseData: Omit<Purchase, 'id' | 'date' | 'invoiceNumber'| 'userId'>): Promise<Purchase> => {
    if (!user || !activeEnterprise) throw new Error("User or enterprise not available");

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const newPurchaseId = uuidv4();
    let newPurchase: Purchase;

    await runTransaction(db, async (transaction) => {
        const enterpriseDoc = await transaction.get(enterpriseDocRef);
        if (!enterpriseDoc.exists()) throw new Error("Enterprise document does not exist!");

        const enterpriseData = enterpriseDoc.data();
        const currentCounter = enterpriseData.purchaseInvoiceCounter || 0;
        const newCount = currentCounter + 1;
        const invoiceNumber = `PURCH-${String(newCount).padStart(4, '0')}`;
        
        newPurchase = {
            id: newPurchaseId,
            invoiceNumber,
            date: new Date().toISOString(),
            userId: user.uid,
            ...purchaseData,
        };

        const currentProducts = enterpriseData.products || [];
        for (const item of newPurchase.items) {
            const productIndex = currentProducts.findIndex((p:any) => p.id === item.productId);
            if (productIndex !== -1) {
                const product = currentProducts[productIndex];
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
            userName: user.displayName || 'Unknown',
            userId: user.uid,
        };

        transaction.update(enterpriseDocRef, {
            purchases: arrayUnion(newPurchase),
            products: currentProducts,
            purchaseInvoiceCounter: newCount,
            enterpriseActivities: arrayUnion(newLog)
        });
    });

    // @ts-ignore
    return newPurchase;
  }, [user, activeEnterprise]);

  const getPurchaseById = useCallback((id: string) => {
    return purchases.find(p => p.id === id);
  }, [purchases]);
  
  const sortedPurchases = useMemo(() => {
    return [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases]);

  const value = {
    purchases: sortedPurchases,
    addPurchase,
    getPurchaseById,
    isLoading: isLoading || isLoadingEnterprises,
  };

  return (
    <PurchasesContext.Provider value={value}>
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
