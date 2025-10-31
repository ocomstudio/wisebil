// src/app/purchase-order/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { UserDataProvider } from '@/context/user-context';
import { Purchase } from '@/types/purchase';
import { CompanyProfile } from '@/types/company';
import { PurchaseOrderTemplate } from '@/components/invoice/purchase-order-template';
import { LocaleProvider } from '@/context/locale-context';
import { Skeleton } from '@/components/ui/skeleton';
import { collectionGroup, query, where, getDocs, limit, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Enterprise } from '@/types/enterprise';
import { User } from '@/context/auth-context';


async function getPurchaseData(id: string): Promise<{ purchase: Purchase; companyProfile: CompanyProfile | null, userData: User | null } | null> {
    const q = query(collectionGroup(db, 'purchases'), where('id', '==', id), limit(1));
    const purchaseSnapshot = await getDocs(q);

    if (purchaseSnapshot.empty) {
        console.warn(`No purchase found with ID: ${id}`);
        return null;
    }

    const purchaseDoc = purchaseSnapshot.docs[0];
    const purchaseData = purchaseDoc.data() as Purchase;
    const enterpriseDocRef = purchaseDoc.ref.parent.parent;
    if (!enterpriseDocRef) {
         console.error(`Could not find parent enterprise for purchase ID: ${id}`);
         return null;
    }

    const enterpriseDocSnap = await getDoc(enterpriseDocRef);
    if (!enterpriseDocSnap.exists()) {
      console.error(`Enterprise document not found for purchase ID: ${id}`);
      return null;
    }

    const enterpriseData = enterpriseDocSnap.data() as Enterprise;
    const companyProfile = enterpriseData.companyProfile || null;
    const ownerId = enterpriseData.ownerId;
    
    const userDocSnap = await getDoc(doc(db, 'users', ownerId));
    const userData = userDocSnap.exists() ? userDocSnap.data().profile as User : null;

    return { purchase: purchaseData, companyProfile, userData };
}

function PublicPurchaseOrderView({ purchase, companyProfile, userData }: { purchase: Purchase, companyProfile: CompanyProfile | null, userData: User | null }) {
    return (
        <UserDataProvider initialData={{profile: userData, preferences: { language: 'fr', currency: 'XOF'}, settings: {}, transactions: [], budgets: [], savingsGoals: [] }}>
            <LocaleProvider>
                <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
                    <PurchaseOrderTemplate purchase={purchase} companyProfile={companyProfile} />
                </div>
            </LocaleProvider>
        </UserDataProvider>
    );
}

export default function PublicPurchaseOrderPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ purchase: Purchase; companyProfile: CompanyProfile | null; userData: User | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getPurchaseData(params.id);
        if (result) {
          setData(result);
        } else {
          setError("Bon de commande non trouvé");
        }
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement du bon de commande.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.id]);


  if (isLoading) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background p-8">
             <Skeleton className="h-full w-full max-w-4xl" />
        </div>
    );
  }

  if (error || !data) {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">{error || "Bon de commande non trouvé"}</h1>
          <p className="text-muted-foreground">Le lien est peut-être incorrect ou le bon de commande a été supprimé.</p>
        </div>
      </div>
    );
  }
  
  return <PublicPurchaseOrderView purchase={data.purchase} companyProfile={data.companyProfile} userData={data.userData} />;
}
