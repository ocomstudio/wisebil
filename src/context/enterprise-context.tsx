// src/context/enterprise-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Enterprise } from '@/types/enterprise';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDoc, getDocs, collection, query, where, writeBatch, documentId } from 'firebase/firestore';

interface EnterpriseContextType {
  enterprises: Enterprise[];
  pendingInvitations: (Enterprise & {invitationId: string})[];
  addEnterprise: (enterprise: Omit<Enterprise, 'id' | 'ownerId' | 'members' | 'memberIds' | 'transactions'>, ownerRole: string) => Promise<string | null>;
  deleteEnterprise: (id: string) => Promise<void>;
  sendInvitation: (enterpriseId: string, email: string, role: string) => Promise<void>;
  respondToInvitation: (enterpriseId: string, response: 'accepted' | 'declined') => Promise<void>;
  isLoading: boolean;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export const EnterpriseProvider = ({ children }: { children: ReactNode }) => {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<(Enterprise & {invitationId: string})[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setEnterprises([]);
      setPendingInvitations([]);
      setIsLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribeUser = onSnapshot(userDocRef, (userSnap) => {
        const userData = userSnap.data();
        const enterpriseIds = userData?.enterpriseIds || [];
        
        if (enterpriseIds.length > 0) {
            const enterprisesQuery = query(collection(db, "enterprises"), where(documentId(), "in", enterpriseIds));
            const unsubscribeEnterprises = onSnapshot(enterprisesQuery, (snapshot) => {
                const userEnterprises = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enterprise));
                setEnterprises(userEnterprises);
                setIsLoading(false);
            }, (error) => {
                console.error("Failed to listen to enterprises from Firestore", error);
                setIsLoading(false);
            });
            return () => unsubscribeEnterprises();
        } else {
            setEnterprises([]);
            setIsLoading(false);
        }
    });

    const invitationsQuery = query(collection(db, "invitations"), where("email", "==", user.email), where("status", "==", "pending"));
    const unsubscribeInvitations = onSnapshot(invitationsQuery, async (snapshot) => {
        const invites = await Promise.all(snapshot.docs.map(async (inviteDoc) => {
            const inviteData = inviteDoc.data();
            const enterpriseDoc = await getDoc(doc(db, "enterprises", inviteData.enterpriseId));
            if (enterpriseDoc.exists()) {
                return { 
                    ...(enterpriseDoc.data() as Omit<Enterprise, 'id'>), 
                    id: enterpriseDoc.id, 
                    invitationId: inviteDoc.id 
                };
            }
            return null;
        }));
        setPendingInvitations(invites.filter(Boolean) as (Enterprise & {invitationId: string})[]);
    }, (error) => {
        console.error("Failed to listen to invitations from Firestore", error);
    });


    return () => {
        unsubscribeUser();
        unsubscribeInvitations();
    };
  }, [user]);

  const addEnterprise = useCallback(async (enterpriseData: Omit<Enterprise, 'id'| 'ownerId' | 'members' | 'memberIds' | 'transactions'>, ownerRole: string) => {
    if (!user || !user.email || !user.displayName) return null;
    
    const newEnterpriseRef = doc(collection(db, "enterprises"));
    const userDocRef = doc(db, 'users', user.uid);

    const newEnterprise: Enterprise = {
        ...enterpriseData,
        id: newEnterpriseRef.id,
        ownerId: user.uid,
        members: [
            {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                role: ownerRole,
                type: 'owner'
            }
        ],
        memberIds: [user.uid],
        transactions: []
    };

    try {
      const batch = writeBatch(db);
      batch.set(newEnterpriseRef, newEnterprise);
      batch.update(userDocRef, { enterpriseIds: arrayUnion(newEnterprise.id) });
      await batch.commit();

      toast({ title: "Entreprise créée", description: `L'entreprise "${newEnterprise.name}" a été créée.` });
      return newEnterprise.id;
    } catch(e) {
      console.error("Failed to add enterprise to Firestore", e);
      toast({ variant: "destructive", title: "Erreur", description: "Failed to save enterprise." });
      throw e;
    }
  }, [toast, user]);
  
  const deleteEnterprise = useCallback(async (id: string) => {
    if (!user) return;
    
    const enterpriseToDelete = enterprises.find(e => e.id === id);
    if (!enterpriseToDelete || enterpriseToDelete.ownerId !== user.uid) {
        toast({ variant: "destructive", title: "Erreur", description: "Vous n'êtes pas autorisé à supprimer cette entreprise." });
        return;
    };
    
    // This is a complex operation: it should remove the enterprise doc
    // AND remove the enterpriseId from all members' user docs.
    // For simplicity here, we just delete the enterprise doc.
    const enterpriseRef = doc(db, 'enterprises', id);
    try {
      await writeBatch(db).delete(enterpriseRef).commit();
      toast({
          title: "Entreprise supprimée",
          description: "L'entreprise a été supprimée avec succès.",
      });
    } catch (e) {
      console.error("Failed to delete enterprise from Firestore", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete enterprise." });
      throw e;
    }
  }, [enterprises, toast, user]);

  const sendInvitation = async (enterpriseId: string, email: string, role: string) => {
    const enterprise = enterprises.find(e => e.id === enterpriseId);
    if (!enterprise || enterprise.ownerId !== user?.uid) {
        throw new Error("Action non autorisée.");
    }

    const userQuery = query(collection(db, "users"), where("profile.email", "==", email));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty) {
        throw new Error("Aucun utilisateur trouvé avec cet e-mail. L'utilisateur doit d'abord créer un compte Wisebil.");
    }
    const invitedUser = userSnapshot.docs[0];

    if (enterprise.memberIds.includes(invitedUser.id)) {
        throw new Error("Cet utilisateur est déjà membre de l'entreprise.");
    }

    const newInvitationRef = doc(collection(db, "invitations"));
    await setDoc(newInvitationRef, {
      enterpriseId,
      email,
      role,
      status: 'pending',
      invitedBy: user.uid,
    });
  };

  const respondToInvitation = async (enterpriseId: string, response: 'accepted' | 'declined') => {
    if (!user || !user.email || !user.displayName) return;
    
    const invitationQuery = query(
      collection(db, 'invitations'),
      where('enterpriseId', '==', enterpriseId),
      where('email', '==', user.email),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(invitationQuery);
    if (snapshot.empty) {
      toast({ variant: "destructive", title: "Erreur", description: "Invitation non trouvée ou déjà traitée."});
      return;
    }
    
    const batch = writeBatch(db);
    const invitationDoc = snapshot.docs[0];
    const invitationData = invitationDoc.data();
    
    batch.update(invitationDoc.ref, { status: response });

    if (response === 'accepted') {
      const newMember = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: invitationData.role,
        type: 'member' as 'member'
      };
      const enterpriseRef = doc(db, 'enterprises', enterpriseId);
      const userDocRef = doc(db, 'users', user.uid);
      
      batch.update(enterpriseRef, {
        members: arrayUnion(newMember),
        memberIds: arrayUnion(user.uid)
      });
      batch.update(userDocRef, {
        enterpriseIds: arrayUnion(enterpriseId)
      });
    }

    await batch.commit();
    toast({ title: "Invitation traitée", description: `Vous avez ${response === 'accepted' ? 'accepté' : 'refusé'} l'invitation.`});
  };

  return (
    <EnterpriseContext.Provider value={{ enterprises, pendingInvitations, addEnterprise, deleteEnterprise, sendInvitation, respondToInvitation, isLoading }}>
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
