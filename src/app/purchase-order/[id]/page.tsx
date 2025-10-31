// src/app/purchase-order/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { UserDataProvider, getUserByPurchaseId, UserData } from '@/context/user-context';
import { Purchase } from '@/types/purchase';
import { PurchaseOrderTemplate } from '@/components/invoice/purchase-order-template';
import { LocaleProvider } from '@/context/locale-context';
import { Skeleton } from '@/components/ui/skeleton';

function PublicPurchaseOrderView({ purchase, userData }: { purchase: Purchase, userData: UserData }) {
    return (
        <UserDataProvider initialData={userData}>
            <LocaleProvider>
                <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
                    <PurchaseOrderTemplate purchase={purchase} companyProfile={userData.companyProfile || null} />
                </div>
            </LocaleProvider>
        </UserDataProvider>
    );
}

export default function PublicPurchaseOrderPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ purchase: Purchase; userData: UserData | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getUserByPurchaseId(params.id);
        if (userData && userData.purchases) {
          const purchase = userData.purchases.find(p => p.id === params.id);
          if (purchase) {
            setData({ purchase, userData });
          } else {
            setError("Bon de commande non trouvé dans les données utilisateur.");
          }
        } else {
          setError("Bon de commande non trouvé ou données utilisateur inaccessibles.");
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
  
  return <PublicPurchaseOrderView purchase={data.purchase} userData={data.userData!} />;
}
