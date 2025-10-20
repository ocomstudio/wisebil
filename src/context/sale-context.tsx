// src/context/sale-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { Sale } from '@/types/sale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { useUserData } from './user-context';

interface SaleContextType {
  sales: Sale[];
  getSaleById: (id: string) => Sale | undefined;
  isLoading: boolean;
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider = ({ children }: { children: ReactNode }) => {
  const { userData, isLoading: isUserDataLoading } = useUserData();
  
  const sales = useMemo(() => {
     if (!userData || !userData.sales) return [];
     return userData.sales.sort((a: Sale, b: Sale) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userData]);
  
  const getSaleById = useCallback((id: string) => {
    return sales.find(s => s.id === id);
  }, [sales]);


  return (
    <SaleContext.Provider value={{ sales, getSaleById, isLoading: isUserDataLoading }}>
      {children}
    </SaleContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SaleContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SaleProvider');
  }
  return context;
};
