// src/app/invoice/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { UserDataProvider, getUserBySaleId } from '@/context/user-context';
import { Sale } from '@/types/sale';
import { CompanyProfile } from '@/types/company';
import { InvoiceTemplate } from '@/components/invoice/invoice-template';
import { LocaleProvider } from '@/context/locale-context';
import { Skeleton } from '@/components/ui/skeleton';

// Server-side data fetching function remains separate
async function getSaleData(id: string): Promise<{ sale: Sale; companyProfile: CompanyProfile | null; userData: any } | null> {
  const userData = await getUserBySaleId(id);
  if (!userData) {
    return null;
  }

  const sale = userData.sales?.find(s => s.id === id);
  if (!sale) {
    return null;
  }
  
  return { sale, companyProfile: userData.companyProfile || null, userData };
}

// Client Component to handle rendering and context providers
function PublicInvoiceView({ sale, userData }: { sale: Sale, userData: any }) {
    return (
        <UserDataProvider initialData={userData}>
            <LocaleProvider>
                <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
                    <InvoiceTemplate sale={sale} />
                </div>
            </LocaleProvider>
        </UserDataProvider>
    );
}


// The Page component is now a client component to manage state and effects
export default function PublicInvoicePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ sale: Sale; userData: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getSaleData(params.id);
        if (result) {
          setData({ sale: result.sale, userData: result.userData });
        } else {
          setError("Facture non trouvée");
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

  return <PublicInvoiceView sale={data.sale} userData={data.userData} />;
}
