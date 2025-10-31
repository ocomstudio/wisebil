// src/context/product-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Product, ProductCategory } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch, arrayUnion, updateDoc, arrayRemove } from 'firebase/firestore';
import { useEnterprise } from './enterprise-context';
import { v4 as uuidv4 } from 'uuid';
import { ActivityLog } from '@/types/activity-log';

interface ProductContextType {
  products: Product[];
  productCategories: ProductCategory[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'initialQuantity'>) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Omit<Product, 'id' | 'initialQuantity'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  addProductCategory: (name: string) => Promise<ProductCategory | null>;
  getCategoryById: (id: string) => ProductCategory | undefined;
  isLoading: boolean;
  logActivity: (type: ActivityLog['type'], description: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { activeEnterprise, isLoading: isLoadingEnterprises } = useEnterprise();
  const [products, setProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isLoadingEnterprises) {
      setIsLoading(true);
      return;
    }
    if (!activeEnterprise) {
      setProducts([]);
      setProductCategories([]);
      setIsLoading(false);
      return;
    }

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const unsubscribe = onSnapshot(enterpriseDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setProducts(data.products || []);
            setProductCategories(data.productCategories || []);
        } else {
            setProducts([]);
            setProductCategories([]);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeEnterprise, isLoadingEnterprises]);

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
  
  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'| 'initialQuantity'>) => {
    if (!user || !activeEnterprise) {
        throw new Error("User or enterprise not available");
    }

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const now = new Date().toISOString();
    const newProduct: Product = { 
        id: uuidv4(), 
        createdAt: now,
        updatedAt: now,
        initialQuantity: productData.quantity,
        ...productData,
    };
    await updateDoc(enterpriseDocRef, { products: arrayUnion(newProduct) });
    await logActivity('product_created', `Produit "${newProduct.name}" créé.`);
  }, [user, activeEnterprise, logActivity]);

  const updateProduct = useCallback(async (id: string, updatedProductData: Partial<Omit<Product, 'id' | 'initialQuantity'>>) => {
    if (!activeEnterprise) throw new Error("Enterprise not available");
    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    
    const currentProducts = [...products];
    const productIndex = currentProducts.findIndex(p => p.id === id);
    if (productIndex === -1) throw new Error("Product not found");

    const updatedProduct = { ...currentProducts[productIndex], ...updatedProductData, updatedAt: new Date().toISOString() };
    currentProducts[productIndex] = updatedProduct;
    
    await updateDoc(enterpriseDocRef, { products: currentProducts });
    await logActivity('product_updated', `Produit "${updatedProduct.name}" mis à jour.`);
  }, [activeEnterprise, products, logActivity]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!activeEnterprise) return;
    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const productToDelete = products.find(p => p.id === id);
    if (productToDelete) {
        await updateDoc(enterpriseDocRef, { products: arrayRemove(productToDelete) });
        await logActivity('product_deleted', `Produit "${productToDelete.name}" supprimé.`);
    }
  }, [activeEnterprise, products, logActivity]);

  const getProductById = useCallback((id: string) => products.find(p => p.id === id), [products]);

  const addProductCategory = useCallback(async (name: string) => {
    if (!activeEnterprise) return null;
    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const newCategory = { id: uuidv4(), name };
    if (productCategories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        toast({ variant: "destructive", title: "Catégorie existante" });
        return null;
    }
    await updateDoc(enterpriseDocRef, { productCategories: arrayUnion(newCategory) });
    return newCategory;
  }, [activeEnterprise, productCategories, toast]);
  
  const getCategoryById = useCallback((id: string) => productCategories.find(c => c.id === id), [productCategories]);


  const value = {
    products,
    productCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    addProductCategory,
    getCategoryById,
    isLoading: isLoading || isLoadingEnterprises,
    logActivity
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
