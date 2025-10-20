// src/context/product-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import type { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { storage } from '@/lib/firebase-storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { useUserData } from './user-context';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  uploadImage: (file: File, path: string) => Promise<string>;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const { userData, isLoading: isUserDataLoading, updateUserData } = useUserData();
  const { toast } = useToast();
  const { user } = useAuth();

  const products = useMemo(() => userData?.products || [], [userData]);

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = { id: uuidv4(), ...productData };

    try {
      await updateUserData({ products: [newProduct] });
    } catch (e) {
      console.error("Failed to add product to Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save product." });
      throw e;
    }
  }, [updateUserData, toast]);

  const updateProduct = useCallback(async (id: string, updatedProductData: Partial<Omit<Product, 'id'>>) => {
    const currentProducts = [...products];
    const productIndex = currentProducts.findIndex(p => p.id === id);

    if (productIndex === -1) {
      toast({ variant: "destructive", title: "Erreur", description: "Produit non trouvé." });
      return;
    }
    
    const updatedProduct = { ...currentProducts[productIndex], ...updatedProductData };
    currentProducts[productIndex] = updatedProduct;

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
  
  const uploadImage = async (file: File, path: string): Promise<string> => {
    if (!user) throw new Error("User not authenticated for image upload.");
    const storageRef = ref(storage, `users/${user.uid}/products/${path}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };


  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, uploadImage, isLoading: isUserDataLoading }}>
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
