// src/app/dashboard/accounting/invoicing/view/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvoicing } from '@/context/invoicing-context';
import { Invoice } from '@/types/invoice';
import { InvoicePreview } from '@/components/dashboard/accounting/invoice-preview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ViewInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { invoices, isLoading } = useInvoicing();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const id = params.id as string;

  useEffect(() => {
    if (!isLoading && id) {
      const foundInvoice = invoices.find(inv => inv.id === id);
      setInvoice(foundInvoice || null);
    }
  }, [id, isLoading, invoices]);

  if (isLoading) {
    return (
        <div className="p-4 md:p-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <Skeleton className="w-full h-[80vh] rounded-lg" />
        </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold">Facture non trouvée</h2>
        <p className="text-muted-foreground mt-2">La facture que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
        </Button>
      </div>
    );
  }

  return (
    <div>
        <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux factures
            </Button>
        </div>
        <InvoicePreview invoice={invoice} />
    </div>
  );
}