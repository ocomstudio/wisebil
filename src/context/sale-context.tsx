// src/context/sale-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo, useState } from 'react';
import type { Sale } from '@/types/sale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { useUserData } from './user-context';
import { useProducts } from './product-context';

interface SaleContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'invoiceNumber'>) => Promise<Sale>;
  getSaleById: (id: string) => Sale | undefined;
  isLoading: boolean;
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider = ({ children }: { children: ReactNode }) => {
  const { userData, isLoading: isUserDataLoading } = useUserData();
  const { updateProduct } = useProducts();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const sales = useMemo(() => {
     if (!userData || !userData.sales) return [];
     return userData.sales.sort((a: Sale, b: Sale) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userData]);


  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);
  
  const generateInvoiceNumber = async (): Promise<string> => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return "SALE-001";
    
    const docSnap = await getDoc(userDocRef);
    const currentCount = docSnap.exists() ? docSnap.data().saleInvoiceCounter || 0 : 0;
    const newCount = currentCount + 1;

    await setDoc(userDocRef, { saleInvoiceCounter: newCount }, { merge: true });
    
    return `SALE-${String(newCount).padStart(4, '0')}`;
  };


  const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date' | 'invoiceNumber'>): Promise<Sale> => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) throw new Error("Utilisateur non authentifié");

    const invoiceNumber = await generateInvoiceNumber();
    const newSale: Sale = {
      id: uuidv4(),
      invoiceNumber,
      date: new Date().toISOString(),
      ...saleData,
    };

    try {
      // 1. Save the sale
      await updateDoc(userDocRef, { sales: arrayUnion(newSale) });
      
      // 2. Update product stock
      for (const item of newSale.items) {
          const product = userData?.products?.find(p => p.id === item.productId);
          if (product) {
              const newQuantity = product.quantity - item.quantity;
              await updateProduct(item.productId, { quantity: newQuantity });
          }
      }
      return newSale;
    } catch (e) {
      console.error("Failed to add sale to Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save sale." });
      throw e;
    }
  }, [getUserDocRef, toast, updateProduct, userData?.products]);
  
  const getSaleById = useCallback((id: string) => {
    return sales.find(s => s.id === id);
  }, [sales]);


  return (
    <SaleContext.Provider value={{ sales, addSale, getSaleById, isLoading: isUserDataLoading }}>
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
