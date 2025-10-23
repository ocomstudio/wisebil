// src/app/purchase-order/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { UserDataProvider, getUserByPurchaseId } from '@/context/user-context';
import { Purchase } from '@/types/purchase';
import { CompanyProfile } from '@/types/company';
import { PurchaseOrderTemplate } from '@/components/invoice/purchase-order-template';
import { LocaleProvider } from '@/context/locale-context';
import { Skeleton } from '@/components/ui/skeleton';


async function getPurchaseData(id: string): Promise<{ purchase: Purchase; companyProfile: CompanyProfile | null, userData: any } | null> {
  const userData = await getUserByPurchaseId(id);
  if (!userData) {
    return null;
  }

  const purchase = userData.purchases?.find(p => p.id === id);
  if (!purchase) {
    return null;
  }
  
  return { purchase, companyProfile: userData.companyProfile || null, userData };
}

function PublicPurchaseOrderView({ purchase, userData }: { purchase: Purchase, userData: any }) {
    return (
        <UserDataProvider initialData={userData}>
            <LocaleProvider>
                <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
                    <PurchaseOrderTemplate purchase={purchase} />
                </div>
            </LocaleProvider>
        </UserDataProvider>
    );
}

export default function PublicPurchaseOrderPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ purchase: Purchase; userData: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getPurchaseData(params.id);
        if (result) {
          setData({ purchase: result.purchase, userData: result.userData });
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
  
  return <PublicPurchaseOrderView purchase={data.purchase} userData={data.userData} />;
}
