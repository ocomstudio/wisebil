// src/context/product-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import type { Product, ProductCategory } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, onSnapshot, runTransaction } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { useLocale } from './locale-context';
import { storage } from '@/lib/firebase-storage';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useEnterprise } from './enterprise-context';
import type { Enterprise } from '@/types/enterprise';
import type { ActivityLog } from '@/types/activity-log';

interface ProductContextType {
  products: Product[];
  productCategories: ProductCategory[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'initialQuantity'>) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
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
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLocale();
  const { enterprises, isLoading: isLoadingEnterprises } = useEnterprise();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For now, we assume the user has only one enterprise.
  const activeEnterprise = useMemo(() => enterprises.length > 0 ? enterprises[0] : null, [enterprises]);

  useEffect(() => {
    if (!activeEnterprise) {
        setIsLoading(false);
        setProducts([]);
        setProductCategories([]);
        return;
    }

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    const unsubscribe = onSnapshot(enterpriseDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const enterpriseData = docSnap.data() as Enterprise;
            setProducts(enterpriseData.products || []);
            setProductCategories(enterpriseData.productCategories || []);
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Failed to listen to enterprise products:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeEnterprise]);
  
  const uploadImage = useCallback(async (file: File, path: string) => {
    if (!user) throw new Error("User not authenticated.");
    const storageRef = ref(storage, `users/${user.uid}/${path}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  }, [user]);

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'initialQuantity'>) => {
    if (!user || !activeEnterprise) throw new Error("User or enterprise not available.");
      
    const now = new Date().toISOString();
    const newProduct: Product = { 
        id: uuidv4(), 
        createdAt: now,
        updatedAt: now,
        ...productData,
        initialQuantity: productData.quantity,
    };
    const cleanedProduct = cleanUndefined(newProduct);
    const newLog: ActivityLog = {
      id: uuidv4(),
      timestamp: now,
      type: 'product_created',
      description: `Produit "${newProduct.name}" créé.`,
      userName: user.displayName || 'Unknown',
      userId: user.uid,
    };

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);

    try {
      await updateDoc(enterpriseDocRef, {
        products: arrayUnion(cleanedProduct),
        enterpriseActivities: arrayUnion(newLog)
      });
    } catch (e) {
      console.error("Failed to add product to Firestore", e);
      toast({ variant: "destructive", title: t('error_title'), description: t('product_add_error', { message: e instanceof Error ? e.message : 'Unknown error' }) });
      throw e;
    }
  }, [user, activeEnterprise, toast, t]);
  
  const addProductCategory = useCallback(async (name: string): Promise<ProductCategory | null> => {
    if (!user || !activeEnterprise) return null;
    
    const newCategory = { id: uuidv4(), name };
    if (productCategories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        toast({ variant: "destructive", title: t('error_title'), description: "Cette catégorie existe déjà." });
        return null;
    }
    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    try {
        await updateDoc(enterpriseDocRef, { productCategories: arrayUnion(newCategory) });
        toast({ title: "Catégorie ajoutée" });
        return newCategory;
    } catch (e) {
        console.error("Failed to add product category", e);
        toast({ variant: "destructive", title: t('error_title'), description: "Failed to save category." });
        return null;
    }
  }, [user, activeEnterprise, productCategories, toast, t]);

  const updateProduct = useCallback(async (id: string, updatedProductData: Partial<Omit<Product, 'id'>>) => {
    if (!activeEnterprise || !user) return;
    
    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    
    try {
      await runTransaction(db, async (transaction) => {
        const enterpriseDoc = await transaction.get(enterpriseDocRef);
        if (!enterpriseDoc.exists()) throw "Enterprise document does not exist!";
        
        const enterpriseData = enterpriseDoc.data() as Enterprise;
        const currentProducts = enterpriseData.products || [];
        const productIndex = currentProducts.findIndex(p => p.id === id);

        if (productIndex === -1) throw "Product not found";

        const existingProduct = currentProducts[productIndex];
        const updatedProduct = cleanUndefined({ 
          ...existingProduct,
          ...updatedProductData,
          updatedAt: new Date().toISOString(),
        });
        
        currentProducts[productIndex] = updatedProduct;

        const newLog: ActivityLog = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          type: 'product_updated',
          description: `Produit "${updatedProduct.name}" mis à jour.`,
          userName: user.displayName || 'Unknown',
          userId: user.uid,
        };
        const currentActivities = enterpriseData.enterpriseActivities || [];

        transaction.update(enterpriseDocRef, { 
          products: currentProducts,
          enterpriseActivities: arrayUnion(newLog)
        });
      });
    } catch (e) {
      console.error("Failed to update product in Firestore", e);
      toast({ variant: "destructive", title: t('error_title'), description: t('product_update_error', { message: e instanceof Error ? e.message : 'Unknown error' }) });
      throw e;
    }
  }, [activeEnterprise, user, toast, t]);

  const deleteProduct = useCallback(async (id: string) => {
     if (!activeEnterprise || !user) return;

    const enterpriseDocRef = doc(db, 'enterprises', activeEnterprise.id);
    
    try {
      await runTransaction(db, async (transaction) => {
        const enterpriseDoc = await transaction.get(enterpriseDocRef);
        if (!enterpriseDoc.exists()) throw "Enterprise document does not exist!";

        const enterpriseData = enterpriseDoc.data() as Enterprise;
        const currentProducts = enterpriseData.products || [];
        const productToDelete = currentProducts.find(p => p.id === id);
        if (!productToDelete) return;

        const updatedProducts = currentProducts.filter(p => p.id !== id);

        const newLog: ActivityLog = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          type: 'product_deleted',
          description: `Produit "${productToDelete.name}" supprimé.`,
          userName: user.displayName || 'Unknown',
          userId: user.uid,
        };
        const currentActivities = enterpriseData.enterpriseActivities || [];

        transaction.update(enterpriseDocRef, {
          products: updatedProducts,
          enterpriseActivities: arrayUnion(newLog)
        });
      });

      toast({ title: t('product_delete_success_title') });
    } catch (e) {
      console.error("Failed to delete product from Firestore", e);
      toast({ variant: "destructive", title: t('error_title'), description: "Failed to delete product." });
      throw e;
    }
  }, [activeEnterprise, user, toast, t]);

  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);
  
  const getCategoryById = useCallback((id: string) => {
    return productCategories.find(c => c.id === id);
  }, [productCategories]);


  return (
    <ProductContext.Provider value={{ products, productCategories, addProduct, updateProduct, deleteProduct, getProductById, getCategoryById, addProductCategory, uploadImage, isLoading: isLoading || isLoadingEnterprises, resetProducts: () => Promise.resolve() }}>
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
