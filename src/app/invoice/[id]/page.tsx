// src/app/invoice/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { UserDataProvider } from '@/context/user-context';
import { Sale } from '@/types/sale';
import { CompanyProfile } from '@/types/company';
import { InvoiceTemplate } from '@/components/invoice/invoice-template';
import { LocaleProvider } from '@/context/locale-context';
import { Skeleton } from '@/components/ui/skeleton';
import { collectionGroup, query, where, getDocs, limit, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Enterprise } from '@/types/enterprise';
import { User } from '@/context/auth-context';


// Server-side data fetching function remains separate
async function getSaleData(id: string): Promise<{ sale: Sale; companyProfile: CompanyProfile | null; userData: User | null } | null> {
  const salesQuery = query(collectionGroup(db, 'sales'), where('id', '==', id), limit(1));
  const saleSnapshot = await getDocs(salesQuery);

  if (saleSnapshot.empty) {
    console.warn(`No sale found with ID: ${id}`);
    return null;
  }

  const saleDoc = saleSnapshot.docs[0];
  const saleData = saleDoc.data() as Sale;
  const enterpriseDocRef = saleDoc.ref.parent.parent;

  if (!enterpriseDocRef) {
    console.error(`Could not find parent enterprise for sale ID: ${id}`);
    return null;
  }
  
  const enterpriseDocSnap = await getDoc(enterpriseDocRef);
  if (!enterpriseDocSnap.exists()) {
      console.error(`Enterprise document not found for sale ID: ${id}`);
      return null;
  }

  const enterpriseData = enterpriseDocSnap.data() as Enterprise;
  const companyProfile = enterpriseData.companyProfile || null;
  const ownerId = enterpriseData.ownerId;
  
  const userDocSnap = await getDoc(doc(db, 'users', ownerId));
  const userData = userDocSnap.exists() ? userDocSnap.data().profile as User : null;

  return { sale: saleData, companyProfile, userData };
}

// Client Component to handle rendering and context providers
function PublicInvoiceView({ sale, companyProfile, userData }: { sale: Sale, companyProfile: CompanyProfile | null, userData: User | null }) {
    // This is a mock provider setup since we can't fully replicate the context server-side
    // for a public page without a logged-in user. The essential data is passed as props.
    const MockCompanyProfileProvider = ({ children }: { children: React.ReactNode }) => (
        <>{children}</> 
    );
    
    return (
        <UserDataProvider initialData={{profile: userData, preferences: { language: 'fr', currency: 'XOF'}, settings: {}, transactions: [], budgets: [], savingsGoals: [] }}>
            <LocaleProvider>
                <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
                    <InvoiceTemplate sale={sale} companyProfile={companyProfile} />
                </div>
            </LocaleProvider>
        </UserDataProvider>
    );
}


// The Page component is now a client component to manage state and effects
export default function PublicInvoicePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ sale: Sale; companyProfile: CompanyProfile | null; userData: User | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getSaleData(params.id);
        if (result) {
          setData(result);
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

  return <PublicInvoiceView sale={data.sale} companyProfile={data.companyProfile} userData={data.userData} />;
}
