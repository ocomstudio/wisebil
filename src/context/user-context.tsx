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
import { doc, getDoc, setDoc, runTransaction, arrayUnion, updateDoc, arrayRemove } from 'firebase/firestore';
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
  conversations?: any;
}


interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  
  // Enterprise-related data and functions
  products?: Product[];
  productCategories?: ProductCategory[];
  sales?: Sale[];
  purchases?: Purchase[];
  companyProfile?: CompanyProfile | null;
  enterpriseActivities?: ActivityLog[];
  
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'initialQuantity'>) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  addProductCategory: (name: string) => Promise<ProductCategory | null>;
  getCategoryById: (id: string) => ProductCategory | undefined;
  
  addSale: (saleData: Omit<Sale, 'id' | 'date' | 'invoiceNumber' | 'userId'>) => Promise<Sale>;
  getSaleById: (id: string) => Sale | undefined;

  addPurchase: (purchaseData: Omit<Purchase, 'id' | 'date' | 'invoiceNumber' | 'userId'>) => Promise<Purchase>;
  getPurchaseById: (id: string) => Purchase | undefined;

  updateCompanyProfile: (newProfile: Partial<CompanyProfile>) => Promise<void>;
  logActivity: (type: ActivityLog['type'], description: string) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const cleanUndefined = (obj: any) => {
  const newObj: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

export const UserDataProvider = ({ children, initialData }: { children: ReactNode, initialData?: UserData | null }) => {
  const { fullUserData: authFullUserData, isLoading: authIsLoading, user } = useAuth();
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

  // --- LOGIC MOVED FROM ENTERPRISE-RELATED PROVIDERS ---

  const {
    products = [],
    productCategories = [],
    sales = [],
    purchases = [],
    companyProfile = null,
    enterpriseActivities = [],
  } = userData || {};

  const sortedSales = useMemo(() => sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [sales]);
  const sortedPurchases = useMemo(() => purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [purchases]);

  const logActivity = useCallback(async (type: ActivityLog['type'], description: string) => {
    if (!user) return;
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;

    const newLog: ActivityLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type,
      description,
      userName: user.displayName || 'Unknown',
      userId: user.uid,
    };
    await updateDoc(userDocRef, { enterpriseActivities: arrayUnion(newLog) });
  }, [user, getUserDocRef]);
  
  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'initialQuantity'>) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) throw new Error("User not available");

    const now = new Date().toISOString();
    const newProduct: Product = { 
        id: uuidv4(), 
        createdAt: now,
        updatedAt: now,
        ...productData,
        initialQuantity: productData.quantity,
    };
    await updateDoc(userDocRef, { products: arrayUnion(cleanUndefined(newProduct)) });
    await logActivity('product_created', `Produit "${newProduct.name}" créé.`);
  }, [getUserDocRef, logActivity]);
  
  const updateProduct = useCallback(async (id: string, updatedProductData: Partial<Omit<Product, 'id'>>) => {
     const userDocRef = getUserDocRef();
    if (!userDocRef) throw new Error("User not available");
    
    const currentProducts = userData?.products || [];
    const productIndex = currentProducts.findIndex(p => p.id === id);
    if (productIndex === -1) throw new Error("Product not found");

    const updatedProduct = { ...currentProducts[productIndex], ...updatedProductData, updatedAt: new Date().toISOString() };
    const newProducts = [...currentProducts];
    newProducts[productIndex] = cleanUndefined(updatedProduct);

    await updateDoc(userDocRef, { products: newProducts });
    await logActivity('product_updated', `Produit "${updatedProduct.name}" mis à jour.`);
  }, [getUserDocRef, userData, logActivity]);

  const deleteProduct = useCallback(async (id: string) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    const productToDelete = (userData?.products || []).find(p => p.id === id);
    if (!productToDelete) return;

    await updateDoc(userDocRef, { products: arrayRemove(productToDelete) });
    await logActivity('product_deleted', `Produit "${productToDelete.name}" supprimé.`);
  }, [getUserDocRef, userData, logActivity]);
  
  const getProductById = useCallback((id: string) => (userData?.products || []).find(p => p.id === id), [userData?.products]);

  const addProductCategory = useCallback(async (name: string) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return null;

    const newCategory = { id: uuidv4(), name };
    if ((userData?.productCategories || []).some(c => c.name.toLowerCase() === name.toLowerCase())) {
        toast({ variant: "destructive", title: "Catégorie existante" });
        return null;
    }
    await updateDoc(userDocRef, { productCategories: arrayUnion(newCategory) });
    return newCategory;
  }, [getUserDocRef, userData, toast]);
  
  const getCategoryById = useCallback((id: string) => (userData?.productCategories || []).find(c => c.id === id), [userData?.productCategories]);

  const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date' | 'invoiceNumber' | 'userId'>) => {
    const userDocRef = getUserDocRef();
    if (!user || !userDocRef) throw new Error("User not authenticated");

    const newSaleId = uuidv4();
    let newSale: Sale;
    
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) throw "User document does not exist!";
      
      const currentData = userDoc.data() as UserData;
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
               if (product.quantity < item.quantity) throw new Error(`Stock insuffisant pour le produit "${product.name}".`);
              updatedProducts[productIndex] = { ...product, quantity: product.quantity - item.quantity };
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

      transaction.update(userDocRef, { 
          sales: updatedSales,
          products: updatedProducts,
          saleInvoiceCounter: newCount,
          enterpriseActivities: arrayUnion(newLog),
      });
    });

    // @ts-ignore
    return newSale;
  }, [user, getUserDocRef, logActivity]);

  const getSaleById = useCallback((id: string) => sortedSales.find(s => s.id === id), [sortedSales]);
  
  const addPurchase = useCallback(async (purchaseData: Omit<Purchase, 'id' | 'date' | 'invoiceNumber' | 'userId'>) => {
    const userDocRef = getUserDocRef();
    if (!user || !userDocRef) throw new Error("User not authenticated");

    const newPurchaseId = uuidv4();
    let newPurchase: Purchase;
    
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) throw "User document does not exist!";
      
      const currentData = userDoc.data() as UserData;
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
        userName: user.displayName || 'Unknown',
        userId: user.uid,
      };

      transaction.update(userDocRef, { 
          purchases: arrayUnion(newPurchase),
          products: updatedProducts,
          purchaseInvoiceCounter: newCount,
          enterpriseActivities: arrayUnion(newLog)
      });
    });

    // @ts-ignore
    return newPurchase;
  }, [user, getUserDocRef, logActivity]);

  const getPurchaseById = useCallback((id: string) => sortedPurchases.find(p => p.id === id), [sortedPurchases]);

  const updateCompanyProfile = useCallback(async (newProfileData: Partial<CompanyProfile>) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    await updateDoc(userDocRef, { 'companyProfile': { ...(userData?.companyProfile || {}), ...newProfileData } });
  }, [getUserDocRef, userData]);


  const value: UserDataContextType = useMemo(() => ({
    userData,
    isLoading,
    updateUserData,
    // Enterprise data and functions
    products,
    productCategories,
    sales: sortedSales,
    purchases: sortedPurchases,
    companyProfile,
    enterpriseActivities,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    addProductCategory,
    getCategoryById,
    addSale,
    getSaleById,
    addPurchase,
    getPurchaseById,
    updateCompanyProfile,
    logActivity,
  }), [
    userData, isLoading, updateUserData, 
    products, productCategories, sortedSales, sortedPurchases, companyProfile, enterpriseActivities,
    addProduct, updateProduct, deleteProduct, getProductById, addProductCategory, getCategoryById,
    addSale, getSaleById, addPurchase, getPurchaseById, updateCompanyProfile, logActivity
  ]);

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
