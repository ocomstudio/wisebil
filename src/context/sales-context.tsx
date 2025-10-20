// src/context/sales-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { Sale } from '@/types/sale';
import { useUserData } from './user-context';

interface SalesContextType {
  sales: Sale[];
  getSaleById: (id: string) => Sale | undefined;
  isLoading: boolean;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const { userData, isLoading: isUserDataLoading } = useUserData();
  
  const sales = useMemo(() => {
     if (!userData || !userData.sales) return [];
     return userData.sales.sort((a: Sale, b: Sale) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userData]);
  
  const getSaleById = useCallback((id: string) => {
    return sales.find(s => s.id === id);
  }, [sales]);


  return (
    <SalesContext.Provider value={{ sales, getSaleById, isLoading: isUserDataLoading }}>
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
