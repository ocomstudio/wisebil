// src/context/sales-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo, useState, useEffect } from 'react';
import type { Sale } from '@/types/sale';
import { useEnterprise } from './enterprise-context';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Enterprise } from '@/types/enterprise';


interface SalesContextType {
  sales: Sale[];
  getSaleById: (id: string) => Sale | undefined;
  isLoading: boolean;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const { enterprises, isLoading: isLoadingEnterprises } = useEnterprise();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For now, we assume the user has only one enterprise.
  const activeEnterprise = useMemo(() => enterprises.length > 0 ? enterprises[0] : null, [enterprises]);

  useEffect(() => {
    if (!activeEnterprise) {
        setIsLoading(false);
        setSales([]);
        return;
    }

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const unsubscribe = onSnapshot(enterpriseDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const enterpriseData = docSnap.data() as Enterprise;
            const sortedSales = (enterpriseData.sales || []).sort((a: Sale, b: Sale) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setSales(sortedSales);
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Failed to listen to enterprise sales:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeEnterprise]);
  
  const getSaleById = useCallback((id: string) => {
    return sales.find(s => s.id === id);
  }, [sales]);


  return (
    <SalesContext.Provider value={{ sales, getSaleById, isLoading: isLoading || isLoadingEnterprises }}>
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
