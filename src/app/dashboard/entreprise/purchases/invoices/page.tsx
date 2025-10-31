// src/app/dashboard/entreprise/purchases/invoices/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileText, MoreHorizontal, ArrowLeft, View } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserData } from "@/context/user-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function PurchaseInvoicesPage() {
  const { purchases = [], isLoading } = useUserData();
  const { t, formatCurrency, formatDate } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/entreprise">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline">{t('purchase_invoices_title')}</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard/entreprise/purchases/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('create_purchase_button')}
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('purchase_invoices_title')}</CardTitle>
          <CardDescription>{t('purchase_invoices_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
             <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
           ) : purchases.length === 0 ? (
             <div className="flex flex-col items-center justify-center text-center p-12 border-dashed border-2 rounded-lg">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">{t('no_purchase_invoices_title')}</h3>
                <p className="text-muted-foreground mt-2 mb-4">{t('no_purchase_invoices_desc')}</p>
                <Button asChild>
                  <Link href="/dashboard/entreprise/purchases/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('create_first_purchase_button')}
                  </Link>
                </Button>
            </div>
           ) : (
            <div className="w-full overflow-x-auto">
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>{t('invoice_number_header')}</TableHead>
                    <TableHead>{t('supplier_header')}</TableHead>
                    <TableHead>{t('issue_date_header')}</TableHead>
                    <TableHead>{t('total_amount_header')}</TableHead>
                    <TableHead className="text-right">{t('actions_header')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.invoiceNumber}</TableCell>
                        <TableCell>{purchase.supplierName}</TableCell>
                        <TableCell>{formatDate(purchase.date)}</TableCell>
                        <TableCell>{formatCurrency(purchase.total)}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem asChild>
                                       <Link href={`/dashboard/entreprise/purchases/invoice/${purchase.id}`}>
                                        <View className="mr-2 h-4 w-4" /> {t('view_action')}
                                       </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
             </Table>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
