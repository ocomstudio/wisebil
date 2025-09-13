// src/components/dashboard/accounting/invoice-preview.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Invoice } from '@/types/invoice';
import { useLocale } from '@/context/locale-context';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(({ invoice }, ref) => {
    const { formatCurrency, formatDate } = useLocale();
    const brandColor = invoice.brandColor || 'hsl(var(--primary))';

    const brandStyle = {
        color: brandColor,
    };
    const brandBgStyle = {
        backgroundColor: brandColor,
    }

  return (
    <Card className="max-w-4xl mx-auto my-8 shadow-2xl" ref={ref}>
      <CardHeader className="p-8" style={{ backgroundColor: `${brandColor}1A` }}>
        <div className="flex justify-between items-start">
          <div>
            {invoice.companyLogoUrl ? (
                 <Image src={invoice.companyLogoUrl} alt="Company Logo" width={120} height={60} className="object-contain" data-ai-hint="company logo"/>
            ) : (
                <h1 className="text-2xl font-bold font-headline" style={brandStyle}>Votre Entreprise</h1>
            )}
            <p className="text-muted-foreground whitespace-pre-line mt-2 text-sm">{invoice.companyAddress}</p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold font-headline" style={brandStyle}>FACTURE</h1>
            <p className="text-muted-foreground"># {invoice.invoiceNumber}</p>
             <Separator className="my-2" style={{ backgroundColor: brandColor, opacity: 0.5 }}/>
            <p><span className="font-semibold">Date d'émission:</span> {formatDate(invoice.issueDate)}</p>
            <p><span className="font-semibold">Date d'échéance:</span> {formatDate(invoice.dueDate)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h2 className="font-semibold text-muted-foreground mb-2">FACTURÉ À</h2>
                <p className="font-bold text-lg">{invoice.customerName}</p>
                {invoice.customerEmail && <p className="text-muted-foreground text-sm">{invoice.customerEmail}</p>}
                <p className="text-muted-foreground whitespace-pre-line text-sm">{invoice.customerAddress}</p>
            </div>
        </div>

        <Table>
            <TableHeader>
                <TableRow style={brandBgStyle} className="hover:bg-primary/90">
                    <TableHead className="text-primary-foreground font-bold rounded-tl-lg">Description</TableHead>
                    <TableHead className="text-center text-primary-foreground font-bold">Quantité</TableHead>
                    <TableHead className="text-right text-primary-foreground font-bold">Prix Unitaire</TableHead>
                    <TableHead className="text-right text-primary-foreground font-bold rounded-tr-lg">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoice.lineItems.map((item) => (
                    <TableRow key={item.id} className="border-x">
                        <TableCell className="font-medium border-r">{item.description}</TableCell>
                        <TableCell className="text-center border-r">{item.quantity}</TableCell>
                        <TableCell className="text-right border-r">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        
        <div className="flex justify-end mt-8">
            <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxe (0%)</span>
                    <span>{formatCurrency(invoice.tax)}</span>
                </div>
                <Separator />
                 <div className="flex justify-between font-bold text-lg" style={brandStyle}>
                    <span>Total</span>
                    <span>{formatCurrency(invoice.total)}</span>
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-8 pt-0">
          <div className="w-full flex justify-between items-end">
                <div>
                     {invoice.stampUrl && (
                        <Image src={invoice.stampUrl} alt="Company Stamp" width={100} height={100} className="object-contain" data-ai-hint="company stamp" />
                     )}
                </div>
                <div>
                     {invoice.signatureUrl && (
                        <>
                            <Image src={invoice.signatureUrl} alt="Signature" width={150} height={60} className="object-contain" data-ai-hint="signature" />
                            <p className="text-center border-t mt-2 pt-1 text-sm text-muted-foreground">Signature</p>
                        </>
                     )}
                </div>
            </div>
      </CardFooter>
    </Card>
  );
});

InvoicePreview.displayName = 'InvoicePreview';
