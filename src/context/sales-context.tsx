// src/context/sales-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Sale, SaleItem } from '@/types/sale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch, arrayUnion, updateDoc, runTransaction, getDoc } from 'firebase/firestore';
import { useEnterprise } from './enterprise-context';
import { v4 as uuidv4 } from 'uuid';
import { useProducts } from './product-context';
import { ActivityLog } from '@/types/activity-log';

interface SalesContextType {
  sales: Sale[];
  addSale: (saleData: Omit<Sale, 'id' | 'date' | 'invoiceNumber' | 'userId'>) => Promise<Sale>;
  getSaleById: (id: string) => Sale | undefined;
  isLoading: boolean;
  logActivity: (type: ActivityLog['type'], description: string) => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { activeEnterprise, isLoading: isLoadingEnterprises } = useEnterprise();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoadingEnterprises) {
        setIsLoading(true);
        return;
    }
    if (!activeEnterprise) {
      setSales([]);
      setIsLoading(false);
      return;
    }

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const unsubscribe = onSnapshot(enterpriseDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setSales(data.sales || []);
        } else {
            setSales([]);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeEnterprise, isLoadingEnterprises]);
  
  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales]);
  
  const logActivity = useCallback(async (type: ActivityLog['type'], description: string) => {
    if (!user || !activeEnterprise) return;
    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);

    const newLog: ActivityLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type,
      description,
      userName: user.displayName || 'Unknown',
      userId: user.uid,
    };
    await updateDoc(enterpriseDocRef, { enterpriseActivities: arrayUnion(newLog) });
  }, [user, activeEnterprise]);

  const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date' | 'invoiceNumber'| 'userId'>): Promise<Sale> => {
    if (!user || !activeEnterprise) {
        throw new Error("User or enterprise not available");
    }

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const newSaleId = uuidv4();
    let newSale: Sale;

    await runTransaction(db, async (transaction) => {
        const enterpriseDoc = await transaction.get(enterpriseDocRef);
        if (!enterpriseDoc.exists()) throw new Error("Enterprise document does not exist!");

        const enterpriseData = enterpriseDoc.data();
        const currentCounter = enterpriseData.saleInvoiceCounter || 0;
        const newCount = currentCounter + 1;
        const invoiceNumber = `SALE-${String(newCount).padStart(4, '0')}`;

        newSale = {
            id: newSaleId,
            invoiceNumber,
            date: new Date().toISOString(),
            userId: user.uid,
            ...saleData,
        };

        const updatedSales = [...(enterpriseData.sales || []), newSale];
        const currentProducts = enterpriseData.products || [];
        
        for (const item of newSale.items) {
            const productIndex = currentProducts.findIndex((p:any) => p.id === item.productId);
            if (productIndex !== -1) {
                const product = currentProducts[productIndex];
                if (product.quantity < item.quantity) throw new Error(`Stock insuffisant pour le produit "${product.name}".`);
                currentProducts[productIndex] = { ...product, quantity: product.quantity - item.quantity };
            } else {
                throw new Error(`Produit avec ID ${item.productId} non trouvé.`);
            }
        }

        const newLog: ActivityLog = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'sale_created',
            description: `Vente #${invoiceNumber} créée pour ${newSale.customerName}.`,
            userName: user.displayName || 'Unknown',
            userId: user.uid,
          };
        
        transaction.update(enterpriseDocRef, { 
            sales: updatedSales,
            products: currentProducts,
            saleInvoiceCounter: newCount,
            enterpriseActivities: arrayUnion(newLog)
        });
    });

    // @ts-ignore
    return newSale;
  }, [user, activeEnterprise]);

  const getSaleById = useCallback((id: string) => {
    return sales.find(s => s.id === id);
  }, [sales]);

  const value = {
    sales: sortedSales,
    addSale,
    getSaleById,
    isLoading: isLoading || isLoadingEnterprises,
    logActivity,
  };

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
