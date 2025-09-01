// src/app/dashboard/accounting/invoicing/view/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useInvoicing } from '@/context/invoicing-context';
import { Invoice } from '@/types/invoice';
import { InvoicePreview } from '@/components/dashboard/accounting/invoice-preview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function ViewInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { invoices, isLoading } = useInvoicing();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  const id = params.id as string;

  useEffect(() => {
    if (!isLoading && id) {
      const foundInvoice = invoices.find(inv => inv.id === id);
      setInvoice(foundInvoice || null);
    }
  }, [id, isLoading, invoices]);
  
  const handleDownload = async () => {
    if (!invoicePreviewRef.current || !invoice) return;
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(invoicePreviewRef.current, {
            scale: 2, // Augmente la résolution pour une meilleure qualité
            useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        let imgWidth = pdfWidth;
        let imgHeight = imgWidth / ratio;
        
        // Si la hauteur de l'image est supérieure à la hauteur du PDF, ajustez
        if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
            imgWidth = imgHeight * ratio;
        }

        const x = (pdfWidth - imgWidth) / 2;
        const y = 0;

        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save(`Facture-${invoice.invoiceNumber}.pdf`);

         toast({
            title: "Téléchargement réussi",
            description: `La facture ${invoice.invoiceNumber} a été téléchargée.`,
        });

    } catch (error) {
        console.error("Erreur lors de la génération du PDF : ", error);
        toast({
            variant: "destructive",
            title: "Erreur de téléchargement",
            description: "Impossible de générer le fichier PDF.",
        });
    } finally {
        setIsDownloading(false);
    }
  };


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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux factures
            </Button>
             <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Télécharger en PDF
            </Button>
        </div>
        <InvoicePreview invoice={invoice} ref={invoicePreviewRef} />
    </div>
  );
}
