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

const sampleInvoices: Invoice[] = [
  {
    id: "INV001",
    invoiceNumber: "INV001",
    customerName: "Ocomstudio",
    customerEmail: "contact@ocomstudio.com",
    customerAddress: "Dakar, Senegal",
    issueDate: "2024-08-15",
    dueDate: "2024-09-14",
    lineItems: [
      { id: "1", description: "Développement de site web", quantity: 1, unitPrice: 250000, total: 250000 },
      { id: "2", description: "Hébergement (1 an)", quantity: 1, unitPrice: 50000, total: 50000 },
    ],
    subtotal: 300000,
    tax: 0,
    total: 300000,
    status: "paid",
  },
  {
    id: "INV002",
    invoiceNumber: "INV002",
    customerName: "Innovatech",
    customerEmail: "contact@innovatech.com",
    customerAddress: "Abidjan, Côte d'Ivoire",
    issueDate: "2024-08-20",
    dueDate: "2024-09-19",
    lineItems: [
      { id: "1", description: "Consultation IA", quantity: 10, unitPrice: 25000, total: 250000 },
    ],
    subtotal: 250000,
    tax: 0,
    total: 250000,
    status: "sent",
  },
    {
    id: "INV003",
    invoiceNumber: "INV003",
    customerName: "Solutions Futura",
    customerEmail: "contact@futura.com",
    customerAddress: "Douala, Cameroun",
    issueDate: "2024-07-30",
    dueDate: "2024-08-29",
    lineItems: [
      { id: "1", description: "Maintenance applicative", quantity: 1, unitPrice: 150000, total: 150000 },
    ],
    subtotal: 150000,
    tax: 0,
    total: 150000,
    status: "overdue",
  },
];

export default function InvoicingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(sampleInvoices);
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
