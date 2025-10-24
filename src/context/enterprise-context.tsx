
// src/context/enterprise-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import type { Enterprise, Invitation, Member } from '@/types/enterprise';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { 
    doc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, 
    getDoc, getDocs, collection, query, where, writeBatch, 
    documentId, runTransaction
} from 'firebase/firestore';
import { useUserData } from './user-context';

const TRIAL_PERIOD_DAYS = 28;


interface EnterpriseContextType {
  enterprises: Enterprise[];
  pendingInvitations: Invitation[];
  addEnterprise: (enterpriseData: Omit<Enterprise, 'id' | 'ownerId' | 'members' | 'memberIds' | 'transactions'>, ownerRole: string) => Promise<string | null>;
  sendInvitation: (enterpriseId: string, email: string, role: string) => Promise<void>;
  respondToInvitation: (invitationId: string, response: 'accepted' | 'declined') => Promise<void>;
  isLoading: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export const EnterpriseProvider = ({ children }: { children: ReactNode }) => {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { userData, isLoading: isUserDataLoading } = useUserData();
  
  const { isTrialActive, trialDaysRemaining } = useMemo(() => {
    if (!user) return { isTrialActive: false, trialDaysRemaining: 0 };
    
    if (user.subscriptionStatus === 'active') {
        return { isTrialActive: true, trialDaysRemaining: Infinity };
    }
    
    const trialStartDate = user.trialStartDate ? new Date(user.trialStartDate) : null;
    if (!trialStartDate) {
        return { isTrialActive: false, trialDaysRemaining: 0 };
    }
    
    const today = new Date();
    const timeDiff = today.getTime() - trialStartDate.getTime();
    const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    const remaining = Math.max(0, TRIAL_PERIOD_DAYS - daysPassed);
    
    return { isTrialActive: remaining > 0, trialDaysRemaining: remaining };

  }, [user]);


  useEffect(() => {
    if (!user || isUserDataLoading) {
      setEnterprises([]);
      setPendingInvitations([]);
      setIsLoading(isUserDataLoading);
      return;
    }

    const enterpriseIds = userData?.enterpriseIds || [];
    
    let unsubscribeEnterprises = () => {};
    if (enterpriseIds.length > 0) {
        const enterprisesQuery = query(collection(db, "enterprises"), where(documentId(), "in", enterpriseIds));
        unsubscribeEnterprises = onSnapshot(enterprisesQuery, (snapshot) => {
            const userEnterprises = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enterprise));
            setEnterprises(userEnterprises);
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to listen to enterprises from Firestore", error);
            setIsLoading(false);
        });
    } else {
        setEnterprises([]);
        setIsLoading(false);
    }
    
    const invitationsQuery = query(collection(db, "invitations"), where("email", "==", user.email), where("status", "==", "pending"));
    const unsubscribeInvitations = onSnapshot(invitationsQuery, (snapshot) => {
        const invites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation));
        setPendingInvitations(invites);
    }, (error) => {
        console.error("Failed to listen to invitations from Firestore", error);
    });

    return () => {
        unsubscribeEnterprises();
        unsubscribeInvitations();
    };
  }, [user, userData, isUserDataLoading]);

  const addEnterprise = useCallback(async (enterpriseData: Omit<Enterprise, 'id'| 'ownerId' | 'members' | 'memberIds' | 'transactions'>, ownerRole: string) => {
    if (!user || !user.uid || !user.email || !user.displayName) {
        toast({ variant: "destructive", title: "Erreur", description: "Informations utilisateur incomplètes. Impossible de créer l'entreprise."});
        return null;
    }

    const newEnterpriseRef = doc(collection(db, "enterprises"));
    const userDocRef = doc(db, 'users', user.uid);

    const newMember: Member = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      role: ownerRole,
      type: 'owner'
    };

    const newEnterpriseData: Enterprise = {
      ...enterpriseData,
      id: newEnterpriseRef.id,
      ownerId: user.uid,
      members: [newMember],
      memberIds: [user.uid],
      transactions: []
    };

    try {
      await runTransaction(db, async (transaction) => {
        // 1. ALL READS FIRST
        const userDoc = await transaction.get(userDocRef);

        // 2. ALL WRITES SECOND
        transaction.set(newEnterpriseRef, newEnterpriseData);
        
        if (!userDoc.exists()) {
          transaction.set(userDocRef, { enterpriseIds: [newEnterpriseRef.id] }, { merge: true });
        } else {
          transaction.update(userDocRef, { enterpriseIds: arrayUnion(newEnterpriseRef.id) });
        }
      });
      
      toast({ title: "Entreprise créée", description: `L'entreprise "${enterpriseData.name}" a été créée avec succès.` });
      return newEnterpriseRef.id;

    } catch (e: any) {
        console.error("La création d'entreprise a échoué :", e);
        toast({ variant: "destructive", title: "Erreur", description: e.message || "Impossible d'enregistrer l'entreprise. Veuillez réessayer." });
        return null;
    }
  }, [toast, user]);


  const sendInvitation = async (enterpriseId: string, email: string, role: string) => {
    if (!user) throw new Error("Action non autorisée.");

    const enterprise = enterprises.find(e => e.id === enterpriseId);
    if (!enterprise) throw new Error("Entreprise non trouvée.");

    const userQuery = query(collection(db, "users"), where("profile.email", "==", email));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty) {
        throw new Error("Aucun utilisateur trouvé avec cet e-mail. L'utilisateur doit d'abord créer un compte Wisebil.");
    }
    const invitedUser = userSnapshot.docs[0];

    if (enterprise.memberIds.includes(invitedUser.id)) {
        throw new Error("Cet utilisateur est déjà membre de l'entreprise.");
    }
    
    const invitationQuery = query(collection(db, 'invitations'), 
        where('enterpriseId', '==', enterpriseId),
        where('email', '==', email),
        where('status', '==', 'pending')
    );
    const existingInvitation = await getDocs(invitationQuery);
    if (!existingInvitation.empty) {
        throw new Error("Une invitation est déjà en attente pour cet utilisateur.");
    }


    const newInvitationRef = doc(collection(db, "invitations"));
    await setDoc(newInvitationRef, {
      id: newInvitationRef.id,
      enterpriseId,
      enterpriseName: enterprise.name,
      email,
      role,
      status: 'pending',
      invitedBy: user.uid,
    });
  };

  const respondToInvitation = async (invitationId: string, response: 'accepted' | 'declined') => {
    if (!user || !user.email || !user.displayName) return;
    
    const invitationRef = doc(db, 'invitations', invitationId);
    
    try {
        await runTransaction(db, async (transaction) => {
            // 1. ALL READS
            const invitationSnap = await transaction.get(invitationRef);
            
            // 2. VALIDATION
            if (!invitationSnap.exists() || invitationSnap.data().status !== 'pending' || invitationSnap.data().email !== user.email) {
                throw new Error("Invitation non valide ou déjà traitée.");
            }

            // 3. ALL WRITES
            if (response === 'accepted') {
                const invitationData = invitationSnap.data();
                const newMember: Member = {
                    uid: user.uid,
                    email: user.email!,
                    name: user.displayName!,
                    role: invitationData.role,
                    type: 'member'
                };
                
                const enterpriseRef = doc(db, 'enterprises', invitationData.enterpriseId);
                const userDocRef = doc(db, 'users', user.uid);
                
                transaction.update(enterpriseRef, {
                    members: arrayUnion(newMember),
                    memberIds: arrayUnion(user.uid)
                });
                transaction.update(userDocRef, {
                    enterpriseIds: arrayUnion(invitationData.enterpriseId)
                });
            }

            transaction.update(invitationRef, { status: response });
        });

        toast({ title: "Invitation traitée", description: `Vous avez ${response === 'accepted' ? 'accepté' : 'refusé'} l'invitation.`});
    } catch(e: any) {
        console.error("Échec de la réponse à l'invitation :", e);
        toast({ variant: "destructive", title: "Erreur", description: e.message || "Impossible de traiter l'invitation." });
    }
  };

  return (
    <EnterpriseContext.Provider value={{ enterprises, pendingInvitations, addEnterprise, sendInvitation, respondToInvitation, isLoading, isTrialActive, trialDaysRemaining }}>
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
