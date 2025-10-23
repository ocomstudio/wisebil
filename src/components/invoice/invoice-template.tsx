// src/components/invoice/invoice-template.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from '@/context/locale-context';
import { useCompanyProfile } from '@/context/company-profile-context';
import Image from 'next/image';
import type { Sale } from '@/types/sale';

interface InvoiceTemplateProps extends React.HTMLAttributes<HTMLDivElement> {
    sale: Sale;
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ sale, ...props }, ref) => {
    const { t, formatCurrency, formatDateTime } = useLocale();
    const { companyProfile } = useCompanyProfile();
    const brandColor = companyProfile?.brandColor || '#179C00';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wisebil.com';
    const publicUrl = `${appUrl}/invoice/${sale.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(publicUrl)}`;

    const brandStyle = { color: brandColor };
    const brandBgStyle = { backgroundColor: brandColor };
    
    return (
        <Card className="max-w-4xl mx-auto my-8 shadow-2xl" ref={ref} {...props}>
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
