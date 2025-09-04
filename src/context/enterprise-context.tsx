// src/context/enterprise-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';

export interface Enterprise {
    id: string;
    name: string;
    description: string;
    ownerId: string;
}

interface EnterpriseContextType {
  enterprises: Enterprise[];
  addEnterprise: (enterprise: Enterprise) => Promise<void>;
  deleteEnterprise: (id: string) => Promise<void>;
  isLoading: boolean;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export const EnterpriseProvider = ({ children }: { children: ReactNode }) => {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setEnterprises([]);
      setIsLoading(false);
      return;
    }

    const userDocRef = getUserDocRef();
    if (!userDocRef) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().enterprises) {
        setEnterprises(docSnap.data().enterprises);
      } else {
        setEnterprises([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to listen to enterprises from Firestore", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, getUserDocRef]);

  const addEnterprise = useCallback(async (enterprise: Enterprise) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef || !user) return;
    
    const enterpriseWithOwner = { ...enterprise, ownerId: user.uid };

    try {
      await setDoc(userDocRef, { enterprises: arrayUnion(enterpriseWithOwner) }, { merge: true });
    } catch(e) {
      console.error("Failed to add enterprise to Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save enterprise." });
      throw e;
    }
  }, [getUserDocRef, toast, user]);
  
  const deleteEnterprise = useCallback(async (id: string) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    const enterpriseToDelete = enterprises.find(e => e.id === id);
    if (!enterpriseToDelete) return;
    
    try {
      await updateDoc(userDocRef, { enterprises: arrayRemove(enterpriseToDelete) });
      toast({
          title: "Entreprise supprimée",
          description: "L'entreprise a été supprimée avec succès.",
      });
    } catch (e) {
      console.error("Failed to delete enterprise from Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete enterprise." });
      throw e;
    }
  }, [enterprises, getUserDocRef, toast]);

  return (
    <EnterpriseContext.Provider value={{ enterprises, addEnterprise, deleteEnterprise, isLoading }}>
      {children}
    </EnterpriseContext.Provider>
  );
};

export const useEnterprise = () => {
  const context = useContext(EnterpriseContext);
  if (context === undefined) {
    throw new Error('useEnterprise must be used within a EnterpriseProvider');
  }
  return context;
};
