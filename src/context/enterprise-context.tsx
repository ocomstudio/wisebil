// src/context/enterprise-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Enterprise, Invitation } from '@/types/enterprise';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch, arrayUnion, setDoc } from 'firebase/firestore';
import { useUserData } from './user-context';
import { v4 as uuidv4 } from 'uuid';


interface EnterpriseContextType {
  enterprises: Enterprise[];
  activeEnterprise: Enterprise | null;
  setActiveEnterprise: (enterpriseId: string | null) => void;
  isLoading: boolean;
  createEnterprise: (name: string, description: string) => Promise<void>;
  invitations: Invitation[];
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export const EnterpriseProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { userData, isLoading: isUserDataLoading } = useUserData();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [activeEnterpriseId, setActiveEnterpriseId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || isUserDataLoading) {
        setIsLoading(true);
        return;
    }

    const enterpriseIds = userData?.enterpriseIds || [];
    
    if (enterpriseIds.length === 0) {
        setEnterprises([]);
        setIsLoading(false);
        if (!activeEnterpriseId) {
          setActiveEnterpriseId(null);
        }
        return;
    }

    const unsubscribes = enterpriseIds.map(id => {
      const docRef = doc(db, 'enterprises', id);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const enterpriseData = { id: docSnap.id, ...docSnap.data() } as Enterprise;
          setEnterprises(prev => {
            const exists = prev.some(e => e.id === enterpriseData.id);
            if (exists) {
              return prev.map(e => e.id === enterpriseData.id ? enterpriseData : e);
            }
            return [...prev, enterpriseData];
          });

          // Set first enterprise as active if none is set
          if (!activeEnterpriseId) {
             setActiveEnterpriseId(enterpriseData.id);
          }
        }
      });
    });

    setIsLoading(false);

    return () => unsubscribes.forEach(unsub => unsub());

  }, [user, userData, isUserDataLoading, activeEnterpriseId]);


  const createEnterprise = async (name: string, description: string) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Utilisateur non authentifié.' });
        return;
    }
    setIsLoading(true);
    try {
        const enterpriseId = uuidv4();
        const userDocRef = doc(db, 'users', user.uid);
        const enterpriseDocRef = doc(db, 'enterprises', enterpriseId);

        const newEnterprise: Enterprise = {
            id: enterpriseId,
            name,
            description,
            ownerId: user.uid,
            members: [{ uid: user.uid, email: user.email || '', name: user.displayName || 'Propriétaire', role: 'owner', type: 'owner' }],
            memberIds: [user.uid],
            transactions: [],
            sales: [],
            products: [],
            purchases: [],
            saleInvoiceCounter: 0,
            purchaseInvoiceCounter: 0,
        };

        const batch = writeBatch(db);
        batch.set(enterpriseDocRef, newEnterprise);
        batch.update(userDocRef, { enterpriseIds: arrayUnion(enterpriseId) });
        await batch.commit();
        
        setActiveEnterpriseId(enterpriseId);
        toast({ title: 'Succès', description: `L'entreprise "${name}" a été créée.` });

    } catch (error) {
        console.error("Error creating enterprise:", error);
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de créer l'entreprise." });
    } finally {
        setIsLoading(false);
    }
  };

  const activeEnterprise = useMemo(() => {
    return enterprises.find(e => e.id === activeEnterpriseId) || null;
  }, [enterprises, activeEnterpriseId]);


  return (
    <EnterpriseContext.Provider value={{ enterprises, activeEnterprise, setActiveEnterprise: setActiveEnterpriseId, isLoading, createEnterprise, invitations }}>
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
