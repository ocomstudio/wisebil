// src/context/product-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import type { Product, ProductCategory } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { storage } from '@/lib/firebase-storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { useUserData } from './user-context';

interface ProductContextType {
  products: Product[];
  productCategories: ProductCategory[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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
  const { userData, isLoading: isUserDataLoading, updateUserData } = useUserData();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const products = useMemo(() => userData?.products || [], [userData]);
  const productCategories = useMemo(() => userData?.productCategories || [], [userData]);

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error("User not authenticated.");
      
    const now = new Date().toISOString();
    const newProduct: Product = { 
        id: uuidv4(), 
        createdAt: now,
        updatedAt: now,
        ...productData 
    };

    const cleanedProduct = cleanUndefined(newProduct);
    const currentProducts = userData?.products || [];
    const updatedProducts = [...currentProducts, cleanedProduct];
    
    try {
        await updateUserData({ products: updatedProducts });
    } catch (e) {
      console.error("Failed to add product to Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save product." });
      throw e;
    }
  }, [user, userData, updateUserData, toast]);
  
  const addProductCategory = useCallback(async (name: string): Promise<ProductCategory | null> => {
    if (!user) return null;
    const newCategory = { id: uuidv4(), name };
    const currentCategories = userData?.productCategories || [];

    if (currentCategories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        toast({ variant: "destructive", title: "Erreur", description: "Cette catégorie existe déjà." });
        return null;
    }

    const updatedCategories = [...currentCategories, newCategory];
    try {
        await updateUserData({ productCategories: updatedCategories });
        toast({ title: "Catégorie ajoutée" });
        return newCategory;
    } catch (e) {
        console.error("Failed to add product category", e);
        toast({ variant: "destructive", title: "Error", description: "Failed to save category." });
        return null;
    }
  }, [user, userData?.productCategories, updateUserData, toast]);

  const updateProduct = useCallback(async (id: string, updatedProductData: Partial<Omit<Product, 'id'>>) => {
    const currentProducts = [...products];
    const productIndex = currentProducts.findIndex(p => p.id === id);

    if (productIndex === -1) {
      toast({ variant: "destructive", title: "Erreur", description: "Produit non trouvé." });
      return;
    }
    
    const updatedProduct = { 
      ...currentProducts[productIndex], 
      ...updatedProductData,
      updatedAt: new Date().toISOString(),
    };
    currentProducts[productIndex] = cleanUndefined(updatedProduct);

    try {
      await updateUserData({ products: currentProducts });
    } catch (e) {
      console.error("Failed to update product in Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to update product." });
      throw e;
    }
  }, [products, updateUserData, toast]);

  const deleteProduct = useCallback(async (id: string) => {
     const updatedProducts = products.filter(p => p.id !== id);
    try {
      await updateUserData({ products: updatedProducts });
      toast({ title: "Produit supprimé" });
    } catch (e) {
      console.error("Failed to delete product from Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete product." });
      throw e;
    }
  }, [products, updateUserData, toast]);

  const resetProducts = useCallback(async () => {
    if (!user) throw new Error("User not authenticated.");
    try {
      await updateUserData({ products: [] });
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
  
  const uploadImage = async (file: File, path: string): Promise<string> => {
    if (!user) throw new Error("User not authenticated for image upload.");
    try {
        const storageRef = ref(storage, `users/${user.uid}/products/${path}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Image upload failed:", error);
        throw new Error("L'envoi de l'image a échoué. Veuillez réessayer.");
    }
  };


  return (
    <ProductContext.Provider value={{ products, productCategories, addProduct, updateProduct, deleteProduct, resetProducts, getProductById, getCategoryById, addProductCategory, uploadImage, isLoading: isUserDataLoading }}>
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
