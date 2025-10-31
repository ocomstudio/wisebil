// src/app/dashboard/entreprise/sales/invoice/[id]/page.tsx
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useUserData } from '@/context/user-context';
import { Sale } from '@/types/sale';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Download, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';
import { InvoiceTemplate } from '@/components/invoice/invoice-template';

export default function ViewSaleInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { getSaleById, isLoading, companyProfile } = useUserData();
  const [sale, setSale] = useState<Sale | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const { t } = useLocale();
  
  const invoiceRef = useRef<HTMLDivElement>(null);
  const id = params.id as string;

  useEffect(() => {
    if (!isLoading && id) {
      const foundSale = getSaleById(id);
      setSale(foundSale || null);
    }
  }, [id, isLoading, getSaleById]);
  
  const handleDownload = async () => {
    if (!invoiceRef.current || !sale) return;
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        let imgWidth = pdfWidth;
        let imgHeight = imgWidth / ratio;
        
        if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
            imgWidth = imgHeight * ratio;
        }

        const x = (pdfWidth - imgWidth) / 2;
        const y = 0;

        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save(`Facture-${sale.invoiceNumber}.pdf`);

        toast({ title: t('download_success_title'), description: t('download_success_desc', { invoiceNumber: sale.invoiceNumber}) });
    } catch (error) {
        console.error("Erreur PDF: ", error);
        toast({ variant: "destructive", title: t('download_error_title'), description: t('download_error_desc') });
    } finally {
        setIsDownloading(false);
    }
  };

  const handleShare = async () => {
     if (!sale) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wisebil.com';
    const publicUrl = `${appUrl}/invoice/${sale.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Facture ${sale.invoiceNumber}`,
          text: `Voici la facture pour ${sale.customerName}.`,
          url: publicUrl,
        });
      } catch (error) {
        console.error("Share error:", error);
      }
    } else {
      navigator.clipboard.writeText(publicUrl);
      toast({ title: t('url_copied_title'), description: t('url_copied_desc')})
    }
  }


  if (isLoading) {
    return (
        <div className="p-4 md:p-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <Skeleton className="w-full h-[80vh] rounded-lg" />
        </div>
    )
  }

  if (!sale) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold">{t('invoice_not_found_title')}</h2>
        <Button onClick={() => router.back()} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> {t('back_button')}</Button>
      </div>
    );
  }

  return (
    <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('back_button')}
            </Button>
            <div className="flex items-center gap-2">
                 <Button onClick={handleShare} size="sm" variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    {t('share_button')}
                 </Button>
                 <Button onClick={handleDownload} disabled={isDownloading} size="sm">
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {t('download_pdf_button')}
                </Button>
            </div>
        </div>
        <InvoiceTemplate sale={sale} companyProfile={companyProfile || null} ref={invoiceRef} />
    </div>
  );
}
