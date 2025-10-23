// src/app/dashboard/entreprise/sales/invoice/[id]/page.tsx
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useSales } from '@/context/sales-context';
import { Sale } from '@/types/sale';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Download, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocale } from '@/context/locale-context';
import { useCompanyProfile } from '@/context/company-profile-context';
import Image from 'next/image';

const InvoiceTemplate = React.forwardRef<HTMLDivElement, { sale: Sale }>(({ sale }, ref) => {
    const { t, formatCurrency, formatDateTime } = useLocale();
    const { companyProfile } = useCompanyProfile();
    const brandColor = companyProfile?.brandColor || '#179C00';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wisebil.com';
    const publicUrl = `${appUrl}/invoice/${sale.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(publicUrl)}`;

    const brandStyle = { color: brandColor };
    const brandBgStyle = { backgroundColor: brandColor };

    return (
        <Card className="max-w-4xl mx-auto my-8 shadow-2xl" ref={ref}>
            <CardHeader className="p-8" style={{ backgroundColor: `${brandColor}1A` }}>
                 <div className="flex justify-between items-start">
                    <div>
                        {companyProfile?.logoUrl ? (
                            <Image src={companyProfile.logoUrl} alt="Company Logo" width={120} height={60} className="object-contain" />
                        ) : (
                            <h1 className="text-2xl font-bold font-headline" style={brandStyle}>{companyProfile?.name || t('your_company_placeholder')}</h1>
                        )}
                        <p className="text-muted-foreground whitespace-pre-line mt-2 text-sm">{companyProfile?.address}</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold font-headline" style={brandStyle}>{t('invoice_title_capital')}</h1>
                        <p className="text-muted-foreground"># {sale.invoiceNumber}</p>
                        <Separator className="my-2" style={{ backgroundColor: brandColor, opacity: 0.5 }}/>
                        <p><span className="font-semibold">{t('issue_date_label')}:</span> {formatDateTime(sale.date)}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="font-semibold text-muted-foreground mb-2">{t('bill_to_label')}</h2>
                        <p className="font-bold text-lg">{sale.customerName}</p>
                        {sale.customerPhone && <p className="text-muted-foreground text-sm">{sale.customerPhone}</p>}
                    </div>
                     <div className="text-right">
                        <Image src={qrCodeUrl} alt="QR Code" width={80} height={80} />
                        <p className="text-xs text-muted-foreground mt-1">Scanner pour voir</p>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow style={brandBgStyle} className="hover:bg-primary/90">
                            <TableHead className="text-primary-foreground font-bold rounded-tl-lg">{t('product_header')}</TableHead>
                            <TableHead className="text-center text-primary-foreground font-bold">{t('quantity_header')}</TableHead>
                            <TableHead className="text-right text-primary-foreground font-bold">{t('unit_price_header')}</TableHead>
                            <TableHead className="text-right text-primary-foreground font-bold rounded-tr-lg">{t('total_header')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sale.items.map((item) => (
                            <TableRow key={item.productId} className="border-x">
                                <TableCell className="font-medium border-r">{item.productName}</TableCell>
                                <TableCell className="text-center border-r">{item.quantity}</TableCell>
                                <TableCell className="text-right border-r">{formatCurrency(item.price)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <div className="flex justify-end mt-8">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between font-bold text-lg" style={brandStyle}>
                            <span>{t('total_label')}</span>
                            <span>{formatCurrency(sale.total)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
             <CardFooter className="p-8 pt-0">
                <div className="w-full flex justify-between items-end">
                    <div>
                        {companyProfile?.stampUrl && (
                            <Image src={companyProfile.stampUrl} alt="Cachet de l'entreprise" width={100} height={100} className="object-contain" />
                        )}
                    </div>
                    <div>
                        {companyProfile?.signatureUrl && (
                            <>
                                <Image src={companyProfile.signatureUrl} alt="Signature" width={150} height={60} className="object-contain" />
                                <p className="text-center border-t mt-2 pt-1 text-sm text-muted-foreground">{t('signature_label')}</p>
                            </>
                        )}
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
});
InvoiceTemplate.displayName = 'InvoiceTemplate';


export default function ViewSaleInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { getSaleById, isLoading } = useSales();
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
        <InvoiceTemplate sale={sale} ref={invoiceRef} />
    </div>
  );
}
