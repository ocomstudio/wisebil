// src/app/invoice/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { UserDataProvider, getUserBySaleId, UserData } from '@/context/user-context';
import { Sale } from '@/types/sale';
import { InvoiceTemplate } from '@/components/invoice/invoice-template';
import { LocaleProvider } from '@/context/locale-context';
import { Skeleton } from '@/components/ui/skeleton';

// Client Component to handle rendering and context providers
function PublicInvoiceView({ sale, userData }: { sale: Sale, userData: UserData }) {
    
    return (
        <UserDataProvider initialData={userData}>
            <LocaleProvider>
                <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
                    <InvoiceTemplate sale={sale} companyProfile={userData.companyProfile || null} />
                </div>
            </LocaleProvider>
        </UserDataProvider>
    );
}

// The Page component is now a client component to manage state and effects
export default function PublicInvoicePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ sale: Sale; userData: UserData | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getUserBySaleId(params.id);
        if (userData && userData.sales) {
          const sale = userData.sales.find(s => s.id === params.id);
           if (sale) {
             setData({ sale, userData });
           } else {
             setError("Facture non trouvée dans les données utilisateur.");
           }
        } else {
          setError("Facture non trouvée ou données utilisateur inaccessibles.");
        }
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement de la facture.");
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
          <h1 className="text-2xl font-bold text-destructive">{error || "Facture non trouvée"}</h1>
          <p className="text-muted-foreground">Le lien de cette facture est peut-être incorrect ou la facture a été supprimée.</p>
        </div>
      </div>
    );
  }

  return <PublicInvoiceView sale={data.sale} userData={data.userData!} />;
}
