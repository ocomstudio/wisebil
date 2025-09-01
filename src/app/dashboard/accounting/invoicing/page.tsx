// src/app/dashboard/accounting/invoicing/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import { Invoice } from "@/types/invoice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvoicing } from "@/context/invoicing-context";

export default function InvoicingPage() {
  const { invoices } = useInvoicing();
  const { t, formatCurrency, formatDate } = useLocale();

  const getStatusVariant = (status: Invoice['status']) => {
    switch (status) {
      case "paid":
        return "default";
      case "sent":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Facturation</h1>
        <Button asChild>
          <Link href="/dashboard/accounting/invoicing/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer une facture
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Vos Factures</CardTitle>
          <CardDescription>Liste de toutes les factures émises.</CardDescription>
        </CardHeader>
        <CardContent>
           {invoices.length === 0 ? (
             <div className="flex flex-col items-center justify-center text-center p-12 border-dashed border-2 rounded-lg">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Aucune facture pour le moment</h3>
                <p className="text-muted-foreground mt-2 mb-4">Commencez par créer votre première facture pour vos clients.</p>
                <Button asChild>
                  <Link href="/dashboard/accounting/invoicing/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer la première facture
                  </Link>
                </Button>
            </div>
           ) : (
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date d'émission</TableHead>
                    <TableHead>Montant Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                        <TableCell>{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Voir</DropdownMenuItem>
                                <DropdownMenuItem>Télécharger en PDF</DropdownMenuItem>
                                <DropdownMenuItem>Marquer comme payée</DropdownMenuItem>
                            </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
             </Table>
           )}
        </CardContent>
      </Card>

    </div>
  );
}
