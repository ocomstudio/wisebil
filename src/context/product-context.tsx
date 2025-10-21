// src/context/product-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import type { Product, ProductCategory } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { useUserData } from './user-context';
import { useLocale } from './locale-context';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface ProductContextType {
  products: Product[];
  productCategories: ProductCategory[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'initialQuantity'>) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getCategoryById: (id: string) => ProductCategory | undefined;
  addProductCategory: (name: string) => Promise<ProductCategory | null>;
  uploadImage: (file: File, path: string) => Promise<string>;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const cleanUndefined = (obj: any) => {
  const newObj: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const { userData, isLoading: isUserDataLoading, updateUserData, logActivity } = useUserData();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLocale();
  
  const products = useMemo(() => userData?.products || [], [userData]);
  const productCategories = useMemo(() => userData?.productCategories || [], [userData]);

  const uploadImage = async (file: File, path: string): Promise<string> => {
    if (!user) throw new Error("User not authenticated.");
    const storage = getStorage();
    const storageRef = ref(storage, `users/${user.uid}/product_images/${path}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };
  
  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'initialQuantity'>) => {
    if (!user) throw new Error("User not authenticated.");
      
    const now = new Date().toISOString();
    const newProduct: Product = { 
        id: uuidv4(), 
        createdAt: now,
        updatedAt: now,
        ...productData,
        initialQuantity: productData.quantity, // Set initial quantity from form
    };

    const cleanedProduct = cleanUndefined(newProduct);
    const currentProducts = userData?.products || [];
    const updatedProducts = [...currentProducts, cleanedProduct];
    
    try {
        await updateUserData({ products: updatedProducts });
        await logActivity({ type: 'product_created', description: `Produit "${newProduct.name}" créé.` });
    } catch (e) {
      console.error("Failed to add product to Firestore", e);
      toast({ variant: "destructive", title: t('error_title'), description: t('product_add_error', { message: e instanceof Error ? e.message : 'Unknown error' }) });
      throw e;
    }
  }, [user, userData, updateUserData, toast, t, logActivity]);
  
  const addProductCategory = useCallback(async (name: string): Promise<ProductCategory | null> => {
    if (!user) return null;
    const newCategory = { id: uuidv4(), name };
    const currentCategories = userData?.productCategories || [];

    if (currentCategories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        toast({ variant: "destructive", title: t('error_title'), description: "Cette catégorie existe déjà." });
        return null;
    }

    const updatedCategories = [...currentCategories, newCategory];
    try {
        await updateUserData({ productCategories: updatedCategories });
        toast({ title: "Catégorie ajoutée" });
        return newCategory;
    } catch (e) {
        console.error("Failed to add product category", e);
        toast({ variant: "destructive", title: t('error_title'), description: "Failed to save category." });
        return null;
    }
  }, [user, userData?.productCategories, updateUserData, toast, t]);

  const updateProduct = useCallback(async (id: string, updatedProductData: Partial<Omit<Product, 'id'>>) => {
    const currentProducts = [...products];
    const productIndex = currentProducts.findIndex(p => p.id === id);

    if (productIndex === -1) {
      toast({ variant: "destructive", title: t('error_title'), description: t('product_not_found_error') });
      return;
    }
    
    const existingProduct = currentProducts[productIndex];
    const updatedProduct = { 
      ...existingProduct,
      ...updatedProductData,
      updatedAt: new Date().toISOString(),
    };
    currentProducts[productIndex] = cleanUndefined(updatedProduct);

    try {
      await updateUserData({ products: currentProducts });
      await logActivity({ type: 'product_updated', description: `Produit "${updatedProduct.name}" mis à jour.` });
    } catch (e) {
      console.error("Failed to update product in Firestore", e);
      toast({ variant: "destructive", title: t('error_title'), description: t('product_update_error', { message: e instanceof Error ? e.message : 'Unknown error' }) });
      throw e;
    }
  }, [products, updateUserData, toast, t, logActivity]);

  const deleteProduct = useCallback(async (id: string) => {
     const productToDelete = products.find(p => p.id === id);
     if (!productToDelete) return;
     
     const updatedProducts = products.filter(p => p.id !== id);
    try {
      await updateUserData({ products: updatedProducts });
      await logActivity({ type: 'product_deleted', description: `Produit "${productToDelete.name}" supprimé.` });
      toast({ title: t('product_delete_success_title') });
    } catch (e) {
      console.error("Failed to delete product from Firestore", e);
      toast({ variant: "destructive", title: t('error_title'), description: "Failed to delete product." });
      throw e;
    }
  }, [products, updateUserData, toast, t, logActivity]);

  const resetProducts = useCallback(async () => {
    if (!user) throw new Error("User not authenticated.");
    try {
      await updateUserData({ products: [], productCategories: [] });
    } catch (e) {
      console.error("Failed to reset products in Firestore", e);
      throw e;
    }
  }, [user, updateUserData]);

  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);
  
  const getCategoryById = useCallback((id: string) => {
    return productCategories.find(c => c.id === id);
  }, [productCategories]);


  return (
    <ProductContext.Provider value={{ products, productCategories, addProduct, updateProduct, deleteProduct, resetProducts, getProductById, getCategoryById, addProductCategory, isLoading: isUserDataLoading, uploadImage }}>
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
